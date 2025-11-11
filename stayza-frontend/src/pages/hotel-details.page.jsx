import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddReviewMutation,
  useCreateBookingMutation,
  useGetHotelByIdQuery,
  useGetReviewsByHotelQuery,
} from "@/lib/api";
import { Building2, Coffee, MapPin, PlusCircle, Star, Tv, Wifi } from "lucide-react";
import { BookingDialog } from "@/components/BookingDialog";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import StarRating from "@/components/StarRating";

const HotelDetailsPage = () => {
  const { _id } = useParams();
  const { data: hotel, isLoading, isError, error } = useGetHotelByIdQuery(_id);
  const {
    data: reviews = [],
    isFetching: isReviewsLoading,
    refetch: refetchReviews,
  } = useGetReviewsByHotelQuery(_id, {
    skip: !_id,
  });
  const [addReview, { isLoading: isAddReviewLoading }] = useAddReviewMutation();
  const [createBooking, { isLoading: isCreateBookingLoading }] = useCreateBookingMutation();
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const reviewFormRef = useRef(null);
  const navigate = useNavigate();

  const reviewCount = reviews?.length ?? 0;

  const formatReviewDate = (dateString) => {
    if (!dateString) {
      return "Recently";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReviewerLabel = (userId) => {
    if (!userId) {
      return "Guest";
    }
    if (userId.length <= 6) {
      return userId;
    }
    return `${userId.slice(0, 6)}…`;
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const trimmedComment = reviewForm.comment.trim();
    if (!trimmedComment) {
      toast.error("Please add a short review before submitting.");
      return;
    }

    try {
      await addReview({
        hotelId: _id,
        comment: trimmedComment,
        rating: Number(reviewForm.rating),
      }).unwrap();
      toast.success("Thanks for sharing your experience!");
      setReviewForm({ rating: 5, comment: "" });
      refetchReviews();
    } catch (error) {
      const message =
        error?.data?.message || "Unable to submit your review right now.";
      toast.error(message);
    }
  };

  const handleScrollToReviewForm = () => {
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBook = async (bookingData) => {
    const toastId = toast.loading("Creating your booking...");
    try {
      const result = await createBooking({
        hotelId: _id,
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

  if (isLoading) {
    return (
      <main className="px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative w-full h-[400px]">
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-9 w-48" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-5 w-5 mr-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-24 w-full" />
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-7 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          Error Loading Hotel Details
        </h2>
        <p className="text-muted-foreground">
          {error?.data?.message ||
            "Something went wrong. Please try again later."}
        </p>
      </div>
    );
  }

  return (
    <main className="px-4">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative w-full h-[400px]">
            <img
              src={hotel.image}
              alt={hotel.name}
              className="absolute object-cover rounded-lg"
            />
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary">Rooftop View</Badge>
            <Badge variant="secondary">French Cuisine</Badge>
            <Badge variant="secondary">City Center</Badge>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{hotel.name}</h1>
              <div className="flex items-center mt-2">
                <MapPin className="h-5 w-5 text-muted-foreground mr-1" />
                <p className="text-muted-foreground">{hotel.location}</p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Star className="h-4 w-4" />
              <span className="sr-only">Add to favorites</span>
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <StarRating
              value={hotel?.rating ? Number(hotel.rating) : 0}
              readOnly
              size="sm"
            />
            <div className="flex items-center space-x-1">
              <span className="font-bold">
                {hotel?.rating ? Number(hotel.rating).toFixed(1) : "No rating yet"}
              </span>
              <span className="text-muted-foreground">
                ({reviewCount === 0 ? "No" : reviewCount} reviews)
              </span>
            </div>
          </div>
          <p className="text-muted-foreground">{hotel.description}</p>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  <span>Free Wi-Fi</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  <span>Restaurant</span>
                </div>
                <div className="flex items-center">
                  <Tv className="h-5 w-5 mr-2" />
                  <span>Flat-screen TV</span>
                </div>
                <div className="flex items-center">
                  <Coffee className="h-5 w-5 mr-2" />
                  <span>Coffee maker</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-2xl font-bold">${hotel.price}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleScrollToReviewForm}
            >
              <PlusCircle className="w-4 h-4" /> Add Review
            </Button>
            <BookingDialog
              hotelName={hotel.name}
              hotelId={_id}
              onSubmit={handleBook}
              isLoading={isCreateBookingLoading}
            />
          </div>
        </div>
      </div>
      <section className="mt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Guest Reviews</h2>
            <p className="text-sm text-muted-foreground">
              Read experiences from other travelers or share your own stay.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {isReviewsLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-32 w-full rounded-xl" />
              ))
            ) : reviewCount > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="rounded-xl border p-5 shadow-sm bg-card">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {getReviewerLabel(review.userId)}
                    </span>
                    <span>{formatReviewDate(review.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={review.rating} readOnly size="sm" />
                    <p className="font-semibold text-foreground">
                      {review.rating}/5
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))
            ) : (
              <Card className="bg-muted/30 px-6 py-6">
                <p className="text-muted-foreground text-sm">
                  No reviews yet. Be the first to tell others about your stay.
                </p>
              </Card>
            )}
          </div>
          <div ref={reviewFormRef}>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-semibold">Share your stay</h3>
                  <p className="text-sm text-muted-foreground">
                    Your feedback helps other guests pick the right stay.
                  </p>
                </div>
                <SignedIn>
                  <form className="space-y-4" onSubmit={handleReviewSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <StarRating
                        value={reviewForm.rating}
                        onChange={(value) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            rating: value,
                          }))
                        }
                        size="lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        {reviewForm.rating} out of 5
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Your review</Label>
                      <Textarea
                        id="comment"
                        placeholder="Tell others what stood out during your stay..."
                        value={reviewForm.comment}
                        onChange={(event) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            comment: event.target.value,
                          }))
                        }
                        rows={5}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isAddReviewLoading}
                    >
                      {isAddReviewLoading ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </SignedIn>
                <SignedOut>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Please sign in to share your experience.
                    </p>
                    <Button className="w-full" asChild>
                      <Link to="/sign-in">Sign In</Link>
                    </Button>
                  </div>
                </SignedOut>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HotelDetailsPage;
