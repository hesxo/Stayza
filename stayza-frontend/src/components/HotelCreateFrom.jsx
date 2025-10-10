import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateHotelMutation } from "@/lib/api";
import { Textarea } from "./ui/textarea";
import { Card } from "@/components/ui/card";

import { DevTool } from "@hookform/devtools";
import { useEffect, useMemo, useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  description: z.string().min(1, {
    message: "Description is required",
  }),
  image: z.string().url({ message: "Image must be a valid URL" }).min(1, {
    message: "Image is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .nonnegative({ message: "Price must be >= 0" }),
});

export default function HotelCreateFrom() {
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      location: "",
      price: 0,
    },
    mode: "onBlur",
  });

  const [createHotel, { isLoading }] = useCreateHotelMutation();
  const [submitted, setSubmitted] = useState(false);

  const imageValue = form.watch("image");

  // small heuristic: show preview only for http(s) urls
  const imagePreview = useMemo(() => {
    try {
      if (!imageValue) return null;
      const url = new URL(imageValue);
      return url.protocol.startsWith("http") ? imageValue : null;
    } catch (e) {
      return null;
    }
  }, [imageValue]);

  // 2. Define a submit handler.
  async function onSubmit(values) {
    setSubmitted(true);
    try {
      await createHotel(values).unwrap();
      // reset on success
      form.reset();
      // optionally show a toast here (sonner) if available in the app
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitted(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Create a new hotel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a hotel listing that guests will see when searching.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel Name" {...field} />
                    </FormControl>
                    <FormDescription>Official hotel name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormDescription>City and country (e.g. Paris, France).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short description" {...field} />
                  </FormControl>
                  <FormDescription>A short description guests will see.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>Link to a representative image (https required).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="100"
                          value={field.value}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            field.onChange(Number.isNaN(val) ? 0 : val);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Price per night in USD.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="border rounded-md overflow-hidden">
                <img src={imagePreview} alt="preview" className="w-full h-56 object-cover" />
              </div>
            )}

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                disabled={isLoading || submitted}
                className="inline-flex items-center gap-2"
              >
                {(isLoading || submitted) && (
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                Create Hotel
              </Button>
            </div>
          </form>
        </Form>

        {/* Devtools - keep available only during development */}
        {process.env.NODE_ENV === "development" && <DevTool control={form.control} />}
      </Card>
    </div>
  );
}