import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { generateEmbedding } from "./utils/embeddings";
import { interpretHotelSearchQuery } from "./utils/query-intent";
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
  "at",
  "looking",
  "find",
  "me",
  "with",
  "please",
  "hotel",
  "hotels",
  "somewhere",
  "someplace",
  "give",
  "show",
  "want",
  "can",
  "you",
  "please",
  "under",
  "below",
  "less",
  "than",
  "within",
  "budget",
  "cheap",
  "cheaper",
  "upto",
  "max",
  "maximum",
  "around",
  "near",
]);

const PRICE_KEYWORDS = new Set([
  "under",
  "below",
  "less",
  "lesser",
  "budget",
  "cheap",
  "cheaper",
  "within",
  "max",
  "maximum",
  "upto",
  "up",
  "around",
  "price",
  "cost",
  "costing",
  "underneath",
  "not",
  "over",
]);

const LOCATION_BOUNDARY_WORDS = new Set([
  "under",
  "below",
  "less",
  "than",
  "with",
  "near",
  "around",
  "within",
  "for",
  "that",
  "who",
  "which",
  "priced",
  "costing",
  "about",
  "price",
  "budget",
  "max",
  "maximum",
]);

const NUMBER_REGEX = /^\d+(\.\d+)?$/;

type MongoLogicalFilter = {
  $or: Record<string, unknown>[];
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const sanitizeLocation = (raw?: string) => {
  if (!raw) {
    return undefined;
  }

  const tokens = raw
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  while (tokens.length) {
    const lastWord = tokens[tokens.length - 1].toLowerCase();
    if (LOCATION_BOUNDARY_WORDS.has(lastWord)) {
      tokens.pop();
    } else {
      break;
    }
  }

  const location = tokens.join(" ").trim();
  return location.length ? location : undefined;
};

const extractPriceCeiling = (query: string) => {
  const normalized = query.toLowerCase();
  const priceRegex =
    /\b(?:under|below|less than|less|within|max(?:imum)?|up to|upto|no more than|not exceeding|budget)\s*\$?\s*(\d+(?:\.\d+)?)(?:\s*(?:usd|dollars|bucks)|\s*\$)?/i;
  const match = normalized.match(priceRegex);

  if (match?.[1]) {
    return Number(match[1]);
  }

  return undefined;
};

const extractSearchTerms = (query: string) => {
  const terms = new Set<string>();

  query
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 2 &&
        !STOP_WORDS.has(token.toLowerCase()) &&
        !PRICE_KEYWORDS.has(token.toLowerCase()) &&
        !NUMBER_REGEX.test(token) &&
        token !== ""
    )
    .forEach((token) => terms.add(token));

  return Array.from(terms);
};

const extractLocationFromQuery = (query: string) => {
  const locationMatch = query.match(/\b(?:in|at|around|near)\s+([a-zA-Z\s]+)/i);
  if (!locationMatch?.[1]) {
    return undefined;
  }
  return sanitizeLocation(locationMatch[1]);
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
    const aiFilters = await interpretHotelSearchQuery(query);

    const locationFromQuery =
      aiFilters?.location ?? extractLocationFromQuery(query);
    const maxPrice =
      aiFilters?.maxPrice ?? extractPriceCeiling(query);
    const minPrice = aiFilters?.minPrice;

    const searchTerms =
      aiFilters?.keywords && aiFilters.keywords.length > 0
        ? aiFilters.keywords
        : extractSearchTerms(query);

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

    const priceConditions: { $lte?: number; $gte?: number } = {};
    if (typeof maxPrice === "number" && !Number.isNaN(maxPrice)) {
      priceConditions.$lte = maxPrice;
    }
    if (typeof minPrice === "number" && !Number.isNaN(minPrice)) {
      priceConditions.$gte = minPrice;
    }

    const priceFilter =
      Object.keys(priceConditions).length > 0 ? { price: priceConditions } : {};

    if (!hotels?.length) {
      const locationFilters: MongoLogicalFilter[] = locationFromQuery
        ? [
            {
              $or: [
                {
                  name: new RegExp(escapeRegex(locationFromQuery), "i"),
                },
                {
                  location: new RegExp(escapeRegex(locationFromQuery), "i"),
                },
                {
                  description: new RegExp(escapeRegex(locationFromQuery), "i"),
                },
              ],
            },
          ]
        : [];

      const termFilters: MongoLogicalFilter[] = searchTerms.map((term) => {
        const regexQuery = new RegExp(escapeRegex(term), "i");
        return {
          $or: [
            { name: regexQuery },
            { location: regexQuery },
            { description: regexQuery },
          ],
        };
      });

      const combinedFilters = [...locationFilters, ...termFilters];

      if (combinedFilters.length) {
        hotels = await Hotel.find({
          ...priceFilter,
          $and: combinedFilters,
        })
          .limit(8)
          .select(projectionFields)
          .lean();

        if (!hotels.length) {
          const orClauses = combinedFilters.flatMap((filter) => filter.$or);

          if (orClauses.length) {
            hotels = await Hotel.find({
              ...priceFilter,
              $or: orClauses,
            })
              .limit(8)
              .select(projectionFields)
              .lean();
          }
        }
      }
    }

    if (!hotels?.length) {
      const regexQuery = new RegExp(escapeRegex(query), "i");
      hotels = await Hotel.find({
        ...priceFilter,
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
