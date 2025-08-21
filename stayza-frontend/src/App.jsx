import Hero from "./components/Hero";
import Navigation from "./components/Navigation";

import HotelListings from "./components/HotelListings";

function App() {
  return (
    <>
      <Navigation />
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
