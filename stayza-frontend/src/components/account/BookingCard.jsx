import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarRange, CreditCard, MapPin, Hash } from "lucide-react";
import StarRating from "@/components/StarRating";

const STATUS_STYLES = {
  PAID: "bg-emerald-100 text-emerald-900 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-900 border-amber-200",
  FAILED: "bg-rose-100 text-rose-900 border-rose-200",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatDateTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (value = 0, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);

const BookingCard = ({ booking }) => {
  const hotel = booking.hotel;
  const statusClass =
    STATUS_STYLES[booking.paymentStatus] || "bg-muted text-foreground";

  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="h-32 w-full overflow-hidden rounded-lg bg-muted sm:w-48">
          {hotel?.image ? (
            <img
              src={hotel.image}
              alt={hotel.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {hotel?.name || "Hotel unavailable"}
                </h3>
                {hotel?.rating ? (
                  <StarRating
                    value={Number(hotel.rating)}
                    readOnly
                    size="sm"
                  />
                ) : null}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {hotel?.location || "Location unavailable"}
              </p>
            </div>
            <Badge className={`w-fit border ${statusClass}`}>
              {booking.paymentStatus}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <CalendarRange className="h-4 w-4" />
                Stay Details
              </p>
              <p>Check-in: {formatDate(booking.checkIn)}</p>
              <p>Check-out: {formatDate(booking.checkOut)}</p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <Hash className="h-4 w-4" />
                Room & Booking
              </p>
              <p>Room {booking.roomNumber}</p>
              <p>
                Booked: {formatDateTime(booking.bookingDate || booking.checkIn)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground">
                <CreditCard className="h-4 w-4" />
                Payment
              </p>
              <p>Total: {formatCurrency(booking.totalAmount)}</p>
              <p>Status: {booking.paymentStatus}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
