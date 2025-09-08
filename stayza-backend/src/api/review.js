import express from "express";
import { createReview, getReviewsForHotel } from "../application/review.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/hotel/:hotelId", getReviewsForHotel);

export default reviewRouter;