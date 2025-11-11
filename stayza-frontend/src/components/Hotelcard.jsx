import { MapPin, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router";
import { BookingDialog } from "./BookingDialog";
import { useCreateBookingMutation } from "@/lib/api";
import { toast } from "sonner";

function HotelCard({ hotel }) {
  const navigate = useNavigate();
  const [createBooking, { isLoading: isCreateBookingLoading }] =
    useCreateBookingMutation();

  const handleBook = async (bookingData) => {
    const toastId = toast.loading("Creating your booking...");
    try {
      const result = await createBooking({
        hotelId: hotel._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
      }).unwrap();
      toast.success(`Room ${result.roomNumber} reserved`, { id: toastId });
      navigate(`/booking/payment?bookingId=${result._id}`);
    } catch (error) {
      const message =
        error?.data?.message || "Unable to create booking. Please try again.";
      toast.error(message, { id: toastId });
      throw error;
    }
  };

  return (
    <div className="group relative rounded-xl border border-border/60 p-3 flex flex-col">
      <Link
        to={`/hotels/${hotel._id}`}
        className="block relative aspect-[4/3] overflow-hidden rounded-xl"
      >
        <img
          src={hotel.image}
          alt={hotel.name}
          className="object-cover w-full h-full absolute transition-transform group-hover:scale-105"
        />
      </Link>
      <div className="mt-3 space-y-2 flex-1">
        <Link to={`/hotels/${hotel._id}`}>
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
        </Link>
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{hotel.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-medium">{hotel?.rating ?? "No rating"}</span>
          <span className="text-muted-foreground">
            ({hotel.reviews?.length ?? "No"} Reviews)
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold">${hotel.price}</span>
          <span className="text-sm text-muted-foreground">per night</span>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          className="flex-1 !text-black !shadow-none hover:!shadow-none"
          asChild
          size="sm"
        >
          <Link to={`/hotels/${hotel._id}`}>View Details</Link>
        </Button>
        <BookingDialog
          hotelName={hotel.name}
          hotelId={hotel._id}
          onSubmit={handleBook}
          isLoading={isCreateBookingLoading}
          triggerLabel="Book"
          triggerProps={{ size: "sm", className: "flex-1" }}
        />
      </div>
    </div>
  );
}

export default HotelCard;
