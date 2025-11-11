import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { generateEmbedding } from "./utils/embeddings";
import stripe from "../infrastructure/stripe";

import { CreateHotelDTO, SearchHotelDTO } from "../domain/dtos/hotel";

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const STOP_WORDS = new Set([
  "i",
  "need",
  "a",
  "an",
  "the",
  "for",
  "to",
  "in",
  "looking",
  "find",
  "me",
  "with",
  "please",
  "hotel",
  "hotels",
  "somewhere",
  "someplace",
]);

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const extractSearchTerms = (query: string) => {
  const terms = new Set<string>();

  const locationMatch = query.match(/\bin\s+([a-zA-Z\s]+)/i);
  if (locationMatch?.[1]) {
    terms.add(locationMatch[1].trim());
  }

  query
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 2 && !STOP_WORDS.has(token.toLowerCase()) && token !== ""
    )
    .forEach((token) => terms.add(token));

  return Array.from(terms);
};

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllHotelsBySearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = SearchHotelDTO.safeParse(req.query);
    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }
    const { query } = result.data;

    const projectionFields = {
      _id: 1,
      name: 1,
      location: 1,
      price: 1,
      image: 1,
      rating: 1,
      reviews: 1,
    };

    const canUseVectorSearch = Boolean(process.env.OPENAI_API_KEY);
    let hotels: any[] = [];

    if (canUseVectorSearch) {
      try {
        const queryEmbedding = await generateEmbedding(query);

        hotels = await Hotel.aggregate([
          {
            $vectorSearch: {
              index: "hotel_vector_index",
              path: "embedding",
              queryVector: queryEmbedding,
              numCandidates: 25,
              limit: 4,
            },
          },
          {
            $project: {
              ...projectionFields,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);
      } catch (vectorSearchError) {
        console.warn(
          "Vector search failed, falling back to regex search:",
          vectorSearchError
        );
      }
    }

    if (!hotels?.length) {
      const searchTerms = extractSearchTerms(query);

      if (searchTerms.length) {
        const andFilters = searchTerms.map((term) => {
          const regexQuery = new RegExp(escapeRegex(term), "i");
          return {
            $or: [
              { name: regexQuery },
              { location: regexQuery },
              { description: regexQuery },
            ],
          };
        });

        hotels = await Hotel.find({ $and: andFilters })
          .limit(8)
          .select(projectionFields)
          .lean();
      } else {
        const regexQuery = new RegExp(escapeRegex(query), "i");
        hotels = await Hotel.find({
          $or: [
            { name: regexQuery },
            { location: regexQuery },
            { description: regexQuery },
          ],
        })
          .limit(8)
          .select(projectionFields)
          .lean();
      }
    }

    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelData = req.body;
    const result = CreateHotelDTO.safeParse(hotelData);

    if (!result.success) {
      throw new ValidationError(`${result.error.message}`);
    }

    const embedding = await generateEmbedding(
      `${result.data.name} ${result.data.description} ${result.data.location} ${result.data.price}`
    );

    // Create Stripe product with default price for the nightly rate
    const product = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        unit_amount: Math.round(result.data.price * 100),
        currency: "usd",
      },
    });

    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : (product.default_price as any)?.id;

    await Hotel.create({
      ...result.data,
      embedding,
      stripePriceId: defaultPriceId,
    });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      throw new ValidationError("Invalid hotel data");
    }

    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    await Hotel.findByIdAndUpdate(_id, hotelData);
    res.status(200).json(hotelData);
  } catch (error) {
    next(error);
  }
};

export const patchHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (!hotelData.price) {
      throw new ValidationError("Price is required");
    }
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndUpdate(_id, { price: hotelData.price });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    await Hotel.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const createHotelStripePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    // Create a product with default price for the hotel's nightly rate
    const product = await stripe.products.create({
      name: hotel.name,
      description: hotel.description,
      default_price_data: {
        unit_amount: Math.round(hotel.price * 100),
        currency: "usd",
      },
    });

    const defaultPriceId =
      typeof product.default_price === "string"
        ? product.default_price
        : (product.default_price as any)?.id;

    const updated = await Hotel.findByIdAndUpdate(
      _id,
      { stripePriceId: defaultPriceId },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
