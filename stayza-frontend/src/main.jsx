import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import HomePage from "./Pages/home.page.jsx";
import SignInPage from "./Pages/sign-in-page.jsx";
import SignUpPage from "./Pages/sign-up-page.jsx";
import NotFoundPage from "./Pages/not-found.page.jsx";
import RootLayout from "./components/layouts/root-layout-page.jsx";
import HotelsPage from "./Pages/hotel.pages.jsx";
import HotelDetailsPage from "./Pages/hotel.details.page.jsx";

import { BrowserRouter, Routes, Route } from "react-router";
import { Provider } from "react-redux";
import { store } from "./lib/store";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/hotels"  element={<HotelsPage />} />
            <Route path="/hotels/:_id" element={<HotelDetailsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);