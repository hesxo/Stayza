import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DateRangePicker from "./DateRangePicker";
import { addDays } from "date-fns";

const formSchema = z
  .object({
    checkIn: z.string(),
    checkOut: z.string(),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

export default function BookingForm({ onSubmit, isLoading, hotelId }) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const getISODate = (date) => date.toISOString().split("T")[0];
  const today = getISODate(todayDate);
  const tomorrow = getISODate(addDays(todayDate, 1));

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkIn: today,
      checkOut: tomorrow,
    },
  });

  const checkInValue = form.watch("checkIn");
  const checkOutValue = form.watch("checkOut");

  const handleRangeSelect = ({ checkIn, checkOut }) => {
    if (checkIn) {
      form.setValue("checkIn", checkIn, { shouldDirty: true, shouldTouch: true });
    }

    if (checkOut) {
      form.setValue("checkOut", checkOut, {
        shouldDirty: true,
        shouldTouch: true,
      });
    } else if (checkIn) {
      const fallbackCheckout = getISODate(addDays(new Date(checkIn), 1));
      form.setValue("checkOut", fallbackCheckout, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    form.trigger(["checkIn", "checkOut"]);
  };

  const handleSubmit = (values) => {
    onSubmit({
      ...values,
      hotelId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <FormLabel>Stay Dates</FormLabel>
          <DateRangePicker
            checkIn={checkInValue}
            checkOut={checkOutValue}
            minDate={todayDate}
            onSelect={handleRangeSelect}
          />
          <p className="text-xs text-muted-foreground">
            Select your check-in and check-out dates using the calendar or the inputs below.
          </p>
        </div>
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-in Date</FormLabel>
              <FormControl>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2"
                  min={today}
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    form.trigger("checkOut");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="checkOut"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Check-out Date</FormLabel>
              <FormControl>
                <input
                  type="date"
                  className="border rounded-md px-3 py-2"
                  min={checkInValue || today}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Booking..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}
