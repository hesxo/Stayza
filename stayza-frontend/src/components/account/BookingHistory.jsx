import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "./BookingCard";
import { Loader2, RefreshCw } from "lucide-react";

const statusOptions = [
  { label: "All statuses", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
];

const BookingHistory = ({
  bookings,
  isLoading,
  isFetching,
  filters,
  onFilterChange,
  onClearFilters,
  onRefresh,
  pagination,
  onPageChange,
}) => {
  const showSkeleton = isLoading;
  const showEmptyState = !isLoading && bookings.length === 0;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="space-y-6" id="bookings">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Booking History</h2>
          <p className="text-sm text-muted-foreground">
            Track every stay you&apos;ve booked with Stayza. Filter by payment
            status or date range to find a specific trip.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="ghost" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status">Payment Status</Label>
          <select
            id="status"
            value={filters.status}
            onChange={(event) => onFilterChange("status", event.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">From</Label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(event) => onFilterChange("startDate", event.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">To</Label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(event) => onFilterChange("endDate", event.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {showSkeleton ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : showEmptyState ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-lg font-medium">No bookings yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Once you make a reservation, it will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <span>
            Page {currentPage} of {totalPages}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isFetching || isLoading}
          >
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isFetching || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookingHistory;
