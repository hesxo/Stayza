import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import AccountDashboard from "@/components/account/AccountDashboard";
import BookingHistory from "@/components/account/BookingHistory";
import { useGetBookingsByUserQuery } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2, ScrollText } from "lucide-react";

const DEFAULT_FILTERS = {
  status: "ALL",
  startDate: "",
  endDate: "",
};

const MyAccountPage = () => {
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const limit = 6;

  const queryArgs = {
    userId: user?.id,
    page,
    limit,
    status: filters.status !== "ALL" ? filters.status : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetBookingsByUserQuery(queryArgs, {
    skip: !user?.id,
  });

  const bookings = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, limit };
  const stats = data?.stats;

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > (pagination?.totalPages || 1) ||
      nextPage === page
    ) {
      return;
    }
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">You need to sign in</p>
          <p className="text-sm text-muted-foreground">
            Please sign in again to view your account.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Account
            </p>
            <h1 className="text-3xl font-semibold">My Account</h1>
            <p className="text-sm text-muted-foreground">
              Manage your profile and follow every booking in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => document.getElementById("bookings")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })}
            >
              <ScrollText className="h-4 w-4" />
              Booking History
            </Button>
          </div>
        </div>

        <AccountDashboard
          user={user}
          stats={stats}
          onManageAccount={() => openUserProfile?.()}
        />

        <BookingHistory
          bookings={bookings}
          isLoading={isLoading && bookings.length === 0}
          isFetching={isFetching}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={refetch}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
};

export default MyAccountPage;
