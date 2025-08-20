import Hero from "./components/Hero";
import Navigation from "./components/ui/navigation";
import HotelListings from ".";
import Hotelcard from './hotelcard';

function App() {
  return (
    <>
      <Navigation /> // react fragment to group multiple elements
      <main>
        <div className="relative min-h-[85vh]">
          <Hero />
        </div>
        <HotelListings />
      </main>
    </>
  );
}

export default App;
