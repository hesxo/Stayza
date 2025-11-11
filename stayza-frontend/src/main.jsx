import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import RootLayout from "./layouts/root-layout.page.jsx";
import HomePage from "./Pages/home.page.jsx";
import HotelDetailsPage from "./Pages/hotel-details.page.jsx";
import HotelsPage from "./Pages/hotels.page.jsx";
import PaymentPage from "./Pages/payment.page.jsx";
import CompletePage from "./Pages/complete.page.jsx";
import NotFoundPage from "./Pages/not-found.page.jsx";
import SignInPage from "./Pages/sign-in.page.jsx";
import SignUpPage from "./Pages/sign-up.page.jsx";
import MyAccountPage from "./Pages/my-account.page.jsx";

import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";
import { store } from "./lib/store";
import AdminProtectLayout from "./layouts/admin-protect.layout.jsx";
import CreateHotelPage from "./Pages/admin/create-hotel.page.jsx";

import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import ProtectLayout from "./layouts/protect.layout.jsx";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              <Route path="/hotels" element={<HotelsPage />} />
              <Route element={<ProtectLayout />}>
                <Route path="/hotels/:_id" element={<HotelDetailsPage />} />
                <Route path="/booking/payment" element={<PaymentPage />} />
                <Route path="/booking/complete" element={<CompletePage />} />
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route element={<AdminProtectLayout />}>
                  <Route
                    path="/admin/create-hotel"
                    element={<CreateHotelPage />}
                  />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ClerkProvider>
  </StrictMode>
);
