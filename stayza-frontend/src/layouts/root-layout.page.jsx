import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function RootLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
      <Footer />
      <Toaster />
    </>
  );
}

export default RootLayout;
