import express from "express";
import {
  getAllHotels,
  createHotel,
  getHotelById,
  updateHotel,
  patchHotel,
  deleteHotel,
} from "../application/hotel";
import isAuthenticated from "./middleware/authentication-middleware";
import { clerkMiddleware } from "@clerk/express";

const hotelsRouter = express.Router();

hotelsRouter
  .route("/")
  .get(getAllHotels)
  .post(clerkMiddleware(), isAuthenticated, createHotel);

hotelsRouter
  .route("/:_id")
  .get(getHotelById)
  .put(updateHotel)
  .patch(patchHotel)
  .delete(deleteHotel);

export default hotelsRouter;
