import Review from "../infrastructure/entities/Review";
import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from "express";

interface ReviewData {
  rating: number;
  comment: string;
  hotelId: string;
}

interface AuthData {
  userId: string;
}

interface RequestWithAuth extends Request {
  auth: () => AuthData;
}

interface ReviewParams {
  hotelId: string;
}

interface ReviewResponse {
  _id: string;
  rating: number;
  comment: string;
  userId: string;
  hotelId: string;
  createdAt: Date;
  updatedAt: Date;
}

const createReview = async (req: RequestWithAuth, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviewData: ReviewData = req.body;
    
    // Validate input data
    if (!reviewData.rating || !reviewData.comment || !reviewData.hotelId) {
      throw new ValidationError("Rating, comment, and hotelId are required");
    }
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new ValidationError("Rating must be between 1 and 5");
    }

    // Get authenticated user
    const authData: AuthData = req.auth();
    const userId: string = authData.userId;
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const hotel = await Hotel.findById(reviewData.hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    const review = await Review.create({
      rating: reviewData.rating,
      comment: reviewData.comment,
      userId,
    });

    hotel.reviews.push(review._id);
    await hotel.save();
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

const getReviewsForHotel = async (req: Request<ReviewParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { hotelId }: ReviewParams = req.params;
      const hotel = await Hotel.findById(hotelId).populate("reviews");
      if (!hotel) {
        throw new NotFoundError("Hotel not found");
      }
  
      res.status(200).json(hotel.reviews);
    } catch (error) {
      next(error);
    }
  };

export { createReview, getReviewsForHotel };
