import Location from "../infrastructure/entities/Location";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { Request, Response, NextFunction } from "express";

interface LocationData {
  name: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface AuthData {
  userId: string;
}

interface RequestWithAuth extends Request {
  auth: () => AuthData;
}

interface LocationParams {
  _id: string;
}

interface LocationResponse {
  _id: string;
  name: string;
  description?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
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
    const authData: AuthData = req.auth();
    const userId: string = authData.userId;
    
    if (!userId) {
      throw new ValidationError("User authentication required");
    }
    
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

export const getLocationById = async (req: Request<LocationParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: LocationParams = req.params;
    const location = await Location.findById(_id);
    if (!location) {
      throw new NotFoundError("Location not found");
    }
    res.status(200).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request<LocationParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: LocationParams = req.params;
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

export const patchLocation = async (req: Request<LocationParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: LocationParams = req.params;
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

export const deleteLocation = async (req: Request<LocationParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { _id }: LocationParams = req.params;
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
