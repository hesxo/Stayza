import mongoose from "mongoose";
import { z } from "zod";

const isValidObjectId = (value: string) => mongoose.Types.ObjectId.isValid(value);

export const CreateBookingDTO = z
  .object({
    hotelId: z
      .string()
      .trim()
      .min(1, "Hotel ID is required")
      .refine(isValidObjectId, "Invalid hotel ID"),
    checkIn: z.coerce.date({
      required_error: "Check-in date is required",
      invalid_type_error: "Check-in date is invalid",
    }),
    checkOut: z.coerce.date({
      required_error: "Check-out date is required",
      invalid_type_error: "Check-out date is invalid",
    }),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (data.checkIn < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check-in date cannot be in the past",
        path: ["checkIn"],
      });
    }

    if (data.checkOut <= data.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Check-out date must be after check-in date",
        path: ["checkOut"],
      });
    }
  });

