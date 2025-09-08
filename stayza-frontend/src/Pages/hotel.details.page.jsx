import { hotels } from "@/data";
import { useParams } from "react-router";

const HotelDetailsPage = () => {
  const { _id } = useParams();

  const hotel = hotels.find((hotel) => hotel._id === _id);
  return (
    <main className="px-4">
      <h1 className="text-2xl font-bold">Hotel Details</h1>
    </main>
  );
};

export default HotelDetailsPage;
