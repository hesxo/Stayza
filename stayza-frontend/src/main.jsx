import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./Pages/home.page.jsx";
import SignInPage from "./Pages/sign-in-page.jsx";
import SignUpPage from "./Pages/sign-up-page.jsx";
import { BrowserRouter,Routes,Route } from "react-router";
import RootLayout from "./components/layouts/root-layout-page.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
       <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

