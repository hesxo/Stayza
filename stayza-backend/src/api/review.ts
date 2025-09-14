import express from "express";
import { createReview, getReviewsForHotel } from "../application/review";
import isAuthenticated from "./middleware/authentication-middleware";

const reviewRouter = express.Router();

reviewRouter.post("/", isAuthenticated, createReview);
reviewRouter.get("/hotel/:hotelId", getReviewsForHotel); //! /api/reviews/hotel/:hotelId

export default reviewRouter;
