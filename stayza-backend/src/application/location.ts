import Location from "../infrastructure/entities/Location";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { Request, Response, NextFunction } from "express";

interface LocationData {
  name: string;
}

interface AuthData {
  userId?: string;
}

interface RequestWithAuth extends Request {
  auth?: () => AuthData;
}

export const getAllLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
    return;
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req: RequestWithAuth, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId: string = req.auth?.()?.userId || '';
    console.log("USER_ID", userId);

    const locationData: LocationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    await Location.create(locationData);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getLocationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const _id: string = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const _id: string = req.params._id;
    const locationData: LocationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }

    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }

    await Location.findByIdAndUpdate(_id, locationData);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const patchLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const _id: string = req.params._id;
    const locationData: LocationData = req.body;
    if (!locationData.name) {
      throw new ValidationError("Location name is required");
    }
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndUpdate(_id, { name: locationData.name });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const _id: string = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    await Location.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
