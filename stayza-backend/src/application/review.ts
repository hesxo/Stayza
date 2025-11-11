import { Request, Response, NextFunction } from "express";
import Review from "../infrastructure/entities/Review";
import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { getAuth } from "@clerk/express";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewData = req.body;
    const rating = Number(reviewData.rating);
    const comment =
      typeof reviewData.comment === "string" ? reviewData.comment.trim() : "";
    const hotelId = reviewData.hotelId;
    const authorNameInput =
      typeof reviewData.authorName === "string"
        ? reviewData.authorName.trim()
        : "";

    if (!rating || rating < 1 || rating > 5 || !comment || !hotelId) {
      throw new ValidationError("Rating, comment, and hotelId are required");
    }

    const { userId } = getAuth(req);

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    const review = await Review.create({
      rating,
      comment,
      userId: userId,
      hotelId,
      authorName: authorNameInput || userId || "Guest",
    });

    const existingReviewCount = hotel.reviews.length;
    hotel.reviews.push(review._id);

    const previousTotal = (hotel.rating ?? 0) * existingReviewCount;
    const newAverage = (previousTotal + rating) / (existingReviewCount + 1);
    hotel.rating = Number(newAverage.toFixed(1));

    await hotel.save();
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const getReviewsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    const reviews = await Review.find({ hotelId })
      .sort({ createdAt: -1 })
      .select("rating comment userId authorName createdAt updatedAt")
      .lean();

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export { createReview, getReviewsForHotel };
