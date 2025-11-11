import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CalendarDays, Mail, Shield } from "lucide-react";
import { toast } from "sonner";

const PREFERENCE_STORAGE_KEY = "stayza_account_preferences";

const defaultPreferences = {
  preferredCurrency: "USD",
  emailUpdates: true,
};

const AccountDashboard = ({ user, stats, onManageAccount }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(PREFERENCE_STORAGE_KEY)
          : null;
      if (raw) {
        setPreferences((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch (error) {
      console.warn("Unable to read account preferences", error);
    }
  }, []);

  const persistPreferences = (nextPrefs) => {
    setPreferences(nextPrefs);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          PREFERENCE_STORAGE_KEY,
          JSON.stringify(nextPrefs)
        );
      }
      toast.success("Account preferences saved");
    } catch (error) {
      toast.error("Unable to save your preferences locally.");
    }
  };

  if (!user) {
    return null;
  }

  const {
    totalBookings = 0,
    upcomingTrips = 0,
    pendingPayments = 0,
    paidBookings = 0,
  } = stats || {};

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "Not provided";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  const statusLabel =
    user.publicMetadata?.role === "admin" ? "Administrator" : "Traveler";

  const handlePreferenceSubmit = (event) => {
    event.preventDefault();
    persistPreferences(preferences);
  };

  return (
    <section className="space-y-6" id="overview">
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold">
                  {(user.fullName || user.username || "G").slice(0, 1)}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {user.fullName || user.username || "Traveler"}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {primaryEmail}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Member since {joinedDate}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              {statusLabel}
            </Badge>
            <Button onClick={onManageAccount} variant="outline">
              Manage Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalBookings}</p>
            <p className="text-sm text-muted-foreground">
              All the trips you&apos;ve planned with Stayza.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{upcomingTrips}</p>
            <p className="text-sm text-muted-foreground">
              Bookings with a future check-in date.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pendingPayments}</p>
            <p className="text-sm text-muted-foreground">
              Complete payment to secure your stay.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card id="settings">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Update your basic preferences. Use the Manage Profile button above
            for name, email, or password changes.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handlePreferenceSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredCurrency">Preferred Currency</Label>
                <select
                  id="preferredCurrency"
                  value={preferences.preferredCurrency}
                  onChange={(event) =>
                    setPreferences((prev) => ({
                      ...prev,
                      preferredCurrency: event.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <option value="USD">USD - United States Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="LKR">LKR - Sri Lankan Rupee</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailUpdates">Travel Updates Email</Label>
                <div className="flex items-center gap-3 rounded-md border border-input px-3 py-2">
                  <input
                    id="emailUpdates"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={preferences.emailUpdates}
                    onChange={(event) =>
                      setPreferences((prev) => ({
                        ...prev,
                        emailUpdates: event.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Send me inspiration and booking reminders
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit">Save Preferences</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => persistPreferences(defaultPreferences)}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default AccountDashboard;
