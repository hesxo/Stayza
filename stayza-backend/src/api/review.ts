import express from "express";
import { createReview, getReviewsForHotel } from "../application/review";
import isAuthenticated from "./middleware/authentication-middleware";
import { clerkMiddleware } from "@clerk/express";

const reviewRouter = express.Router();

// Ensure Clerk initializes auth context before our auth check
reviewRouter.post("/", clerkMiddleware(), isAuthenticated, createReview);
reviewRouter.get("/hotel/:hotelId", getReviewsForHotel); //! /api/reviews/hotel/:hotelId

export default reviewRouter;
