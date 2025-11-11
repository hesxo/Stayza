import CheckoutForm from "@/components/CheckoutForm";
import { useSearchParams } from "react-router";
import { useGetBookingByIdQuery, useGetHotelByIdQuery } from "@/lib/api";

function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const { data: booking, isLoading: isBookingLoading } =
    useGetBookingByIdQuery(bookingId);
  const {
    data: hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
  } = useGetHotelByIdQuery(booking?.hotelId, {
    skip: !booking?.hotelId,
  });

  if (isBookingLoading && !booking) {
    return <div>Loading...</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <h2 className="text-4xl font-bold">Review Your Booking</h2>
      <p className="text-muted-foreground mt-2">
        Confirm the hotel details below and proceed with payment when you are ready.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Hotel Information</h3>
          {isHotelLoading && <p className="text-sm text-muted-foreground">Fetching hotel details...</p>}
          {isHotelError && (
            <p className="text-sm text-red-500">
              Unable to load hotel data. Please refresh or continue with payment if you recognize the booking.
            </p>
          )}
          {hotel && (
            <>
              <div className="rounded-xl overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-64 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold">{hotel.name}</p>
                <p className="text-sm text-muted-foreground">{hotel.location}</p>
                <p className="text-sm text-muted-foreground">
                  ${hotel.price} per night · Booking ID {booking?._id}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {hotel.description}
                </p>
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Payment</h3>
          <CheckoutForm bookingId={booking._id} />
        </section>
      </div>

      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          Need help? Contact{" "}
          <a href="mailto:payments@stayza.com" className="text-blue-600 underline">
            payments@stayza.com
          </a>{" "}
          with your booking reference.
        </p>
      </div>
    </main>
  );
}

export default PaymentPage;
