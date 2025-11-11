import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_STRIPE_PUBLISHABLE_KEY");
}
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const CheckoutForm = ({ bookingId }) => {
  const { getToken } = useAuth();

  const fetchClientSecret = useCallback(async () => {
    if (!bookingId) {
      throw new Error("bookingId is required to create a checkout session");
    }

    const token = await getToken();
    if (!token) {
      throw new Error("Unable to authenticate payment request");
    }

    const res = await fetch(`${BACKEND_URL}/api/payments/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.message || "Unable to start payment session";
      throw new Error(message);
    }

    const data = await res.json();
    if (!data?.clientSecret) {
      throw new Error("Invalid response from payment session API");
    }
    return data.clientSecret;
  }, [bookingId, getToken]);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutForm;

