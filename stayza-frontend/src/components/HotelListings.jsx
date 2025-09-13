import HotelCard from "@/components/HotelCard";
import {
  useGetAllHotelsQuery,
  useGetAllLocationsQuery,
  useAddLocationMutation,
} from "@/lib/api";
import { Skeleton } from "./ui/skeleton";
import { useState } from "react";
import LocationTab from "./LocationTab";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

function HotelListings() {
  const [selectedLocation, setSelectedLocation] = useState(0);

  const {
    data: hotels,
    isLoading: isHotelsLoading,
    isError: isHotelsError,
    error: hotelsError,
  } = useGetAllHotelsQuery();

  const {
    data: locations,
    isLoading: isLocationsLoading,
    isError: isLocationsError,
    error: locationsError,
  } = useGetAllLocationsQuery();

  const [
    addLocation,
    {
      isLoading: isAddLocationLoading,
      isError: isAddLocationError,
      error: addLocationError,
    },
  ] = useAddLocationMutation();

  const allLocations = locations
    ? [{ _id: 0, name: "All" }, ...locations.filter((loc) => loc.name !== "lol")]
    : [{ _id: 0, name: "All" }];

  const handleLocationSelect = (selectedLocation) => {
    setSelectedLocation(selectedLocation._id);
  };

  const selectedLocationName = allLocations.find(
    (el) => selectedLocation === el._id
  ).name;

  const filteredHotels =
    selectedLocation === 0
      ? hotels
      : hotels.filter((hotel) => {
          return hotel.location.includes(selectedLocationName);
        });

  const isLoading = isHotelsLoading || isLocationsLoading;
  const isError = isHotelsError || isLocationsError;
  const error = [hotelsError, locationsError];

  const handleAddLocation = async () => {
    const toastId = toast.loading("Adding location...");
    try {
      await addLocation({ name: "Fiji" }).unwrap();
      toast.success("Location added successfully");
      toast.dismiss(toastId);      const allLocations = locations
        ? [{ _id: 0, name: "All" }, ...locations.filter(loc => loc.name !== "lol")]
        : [{ _id: 0, name: "All" }];
    } catch (error) {
      toast.error("Failed to add location");
      toast.dismiss(toastId);
    }
  };

  if (isLoading) {
    return (
      <section className="px-8 py-8 lg:py-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Top trending hotels worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the most trending hotels worldwide for an unforgettable
            experience.
          </p>
        </div>

        <Skeleton className="h-6 flex items-center flex-wrap gap-x-4" />

        <Skeleton className="h-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="px-8 py-8 lg:py-8">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Top trending hotels worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover the most trending hotels worldwide for an unforgettable
            experience.
          </p>
        </div>
        <p className="text-red-500">Error loading data </p>
      </section>
    );
  }

  return (
    <section className="px-8 py-8 lg:py-8">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Top trending hotels worldwide
        </h2>
        <p className="text-lg text-muted-foreground">
          Discover the most trending hotels worldwide for an unforgettable
          experience.
        </p>
        <Button
          disabled={isAddLocationLoading}
          className={`${isAddLocationLoading ? "opacity-50" : ""}`}
          onClick={handleAddLocation}
        >
          <PlusCircle className="w-4 h-4" /> Add Location
        </Button>
      </div>

      <div className="flex items-center flex-wrap gap-x-4">
        {allLocations.map((location) => {
          return (
            <LocationTab
              onClick={handleLocationSelect}
              location={location}
              selectedLocation={selectedLocation}
              key={location._id}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
        {filteredHotels.map((hotel) => {
          return <HotelCard key={hotel._id} hotel={hotel} />;
        })}
      </div>
    </section>
  );
}

export default HotelListings;