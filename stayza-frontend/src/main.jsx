import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./Pages/home.page.jsx";
import SignInPage from "./Pages/sign-in-page.jsx";
import SignUpPage from "./Pages/sign-up-page.jsx";
import NotFoundPage from "./Pages/not-found.page.jsx";
import HotelPage from "./Pages/hotel.pages.jsx";
import HotelDetailPage from "./Pages/hotel.details.page.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import RootLayout from "./components/layouts/root-layout-page.jsx";
import { Provider } from "react-redux";
import { store } from "./lib/store"; 
import { ClerkProvider } from "@clerk/clerk-react"; 

import "./index.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/hotels" element={<HotelPage />} />
            <Route path="/hotels/:_id" element={<HotelDetailPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
    </ClerkProvider>
  </StrictMode>
);

