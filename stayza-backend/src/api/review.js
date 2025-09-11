import express from "express";
import { createReview, getReviewsForHotel } from "../application/review.js";
import isAuthenticated from "./middleware/authentication-middleware.js";

const reviewRouter = express.Router();

reviewRouter.post("/", isAuthenticated, createReview);
reviewRouter.get("/hotel/:hotelId", getReviewsForHotel); //! /api/reviews/hotel/:hotelId

export default reviewRouter;
