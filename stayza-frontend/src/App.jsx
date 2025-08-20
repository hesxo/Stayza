import Hotelcard from './hotelcard'
import user from './Hasal'
import Navigation from "./components/Navigation";
import { Button } from "./components/ui/button";
import { hotels } from "./data"; 

function App() {
  return (
    <>
      <Navigation />
      <Button />
      {hotels.map((hotel) => (
        <Hotelcard key={hotel.id} hotel={hotel} />
      ))}
    </>
  );
}
