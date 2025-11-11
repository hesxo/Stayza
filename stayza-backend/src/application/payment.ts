import { Request, Response } from "express";
import util from "util";
import { getAuth } from "@clerk/express";
import Booking from "../infrastructure/entities/Booking";
import stripe from "../infrastructure/stripe";
import Hotel from "../infrastructure/entities/Hotel";

const FRONTEND_URL = (process.env.FRONTEND_URL as string) || "http://localhost:5173";
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const bookingId = req.body.bookingId as string;
    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "You are not allowed to pay for this booking" });
    }
    if (booking.paymentStatus === "PAID") {
      return res.status(409).json({ message: "Booking is already paid" });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const numberOfNights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Require stored price and use price + quantity only
    if (!hotel.stripePriceId) {
      return res.status(400).json({ message: "Stripe price ID is missing for this hotel" });
    }
    const lineItem = { price: hotel.stripePriceId, quantity: numberOfNights } as const;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: [lineItem],
      mode: "payment",
      client_reference_id: booking._id.toString(),
      return_url: `${FRONTEND_URL}/booking/complete?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        bookingId: booking._id.toString(),
        userId,
      },
    });

    if (!session.client_secret) {
      return res.status(500).json({ message: "Stripe session missing client secret" });
    }

    res.send({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  try {
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ message: "session_id query param is required" });
    }

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.userId !== userId) {
      return res.status(403).json({ message: "You are not allowed to view this payment" });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // If paid, mark booking as PAID (idempotent update)
    if (checkoutSession.payment_status === "paid" && booking.paymentStatus !== "PAID") {
      await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
    }

    const updatedBooking = await Booking.findById(booking._id);

    res.status(200).json({
      bookingId: booking._id,
      booking: updatedBooking ?? booking,
      hotel,
      status: checkoutSession.status,
      customer_email: checkoutSession.customer_details?.email,
      paymentStatus: updatedBooking?.paymentStatus ?? booking.paymentStatus,
      sessionId,
    });
  } catch (error) {
    console.error("Error retrieving session status:", error);
    res.status(500).json({ message: "Failed to retrieve session status" });
  }
};

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session " + sessionId);
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });
  console.log(util.inspect(checkoutSession, false, null, true));

  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.paymentStatus !== "PENDING") {
    return; // already handled
  }

  if (checkoutSession.payment_status !== "unpaid") {
    await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "PAID" });
  }
}

async function failCheckout(sessionId: string, reason?: string) {
  console.warn(`Marking checkout ${sessionId} as failed`, reason);
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const booking = await Booking.findById(checkoutSession.metadata?.bookingId);
  if (!booking) {
    return;
  }
  if (booking.paymentStatus === "PAID") {
    return;
  }
  await Booking.findByIdAndUpdate(booking._id, { paymentStatus: "FAILED" });
}

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body as Buffer; // raw body
  const sig = req.headers["stripe-signature"] as string;

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).send("Webhook signing secret missing");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout((event.data.object as any).id);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await failCheckout((event.data.object as any).id, event.type);
        break;
      default:
        break;
    }
    return res.status(200).send();
  } catch (error: any) {
    console.error("Webhook handling failed", error);
    return res.status(500).send(`Webhook handler error: ${error.message}`);
  }
};
