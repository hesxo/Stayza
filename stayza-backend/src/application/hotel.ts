import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { Request, Response, NextFunction } from "express";

interface HotelData {
  name: string;
  image: string;
  location: string;
  price: number;
  description: string;
  amenities?: string[];
  rating?: number;
  availability?: boolean;
}

interface HotelParams {
  _id: string;
}

interface HotelPatchData {
  price: number;
}

interface HotelResponse {
  _id: string;
  name: string;
  image: string;
  location: string;
  price: number;
  description: string;
  amenities?: string[];
  rating?: number;
  availability?: boolean;
  reviews?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const getAllHotels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotelData: HotelData = req.body;
    if (
      !hotelData.name ||
      !hotelData.image ||
      !hotelData.location ||
      !hotelData.price ||
      !hotelData.description
    ) {
      throw new ValidationError("Invalid hotel data");
    }
    await Hotel.create(hotelData);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: HotelParams = req.params;
    const hotel = await Hotel.findById(_id);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: HotelParams = req.params;
    const hotelData: HotelData = req.body;
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

export const patchHotel = async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: HotelParams = req.params;
    const hotelData: HotelPatchData = req.body;
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

export const deleteHotel = async (req: Request<HotelParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: HotelParams = req.params;
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
