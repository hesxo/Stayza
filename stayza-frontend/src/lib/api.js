import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://stayza-backend-production.up.railway.app/";

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/`,
    prepareHeaders: async (headers) => {
      return new Promise((resolve) => {
        async function checkToken() {
          const clerk = window.Clerk;
          if (clerk) {
            const token = await clerk.session?.getToken();
            headers.set("Authorization", `Bearer ${token}`);
            resolve(headers);
          } else {
            setTimeout(checkToken, 500);
          }
        }
        checkToken();
      });
    },
  }),
  tagTypes: ["Hotels", "Locations", "Reviews", "Bookings"],
  endpoints: (build) => ({
    getAllHotels: build.query({
      query: () => "hotels",
      providesTags: (result, error, id) => [{ type: "Hotels", id: "LIST" }],
    }),
    getHotelsBySearch: build.query({
      query: (search) => `hotels/search?query=${search}`,
      providesTags: (result, error, search) => [{ type: "Hotels", id: search }],
    }),
    getHotelById: build.query({
      query: (id) => `hotels/${id}`,
      providesTags: (result, error, id) => [{ type: "Hotels", id }],
    }),
    createHotel: build.mutation({
      query: (hotel) => ({
        url: "hotels",
        method: "POST",
        body: hotel,
      }),
      invalidatesTags: (result, error, id) => [{ type: "Hotels", id: "LIST" }],
    }),
    createBooking: build.mutation({
      query: (booking) => ({
        url: "bookings",
        method: "POST",
        body: booking,
      }),
      invalidatesTags: [{ type: "Bookings", id: "LIST" }],
    }),
    getBookingById: build.query({
      query: (bookingId) => `bookings/${bookingId}`,
    }),
    createCheckoutSession: build.mutation({
      query: (payload) => ({
        url: `payments/create-checkout-session`,
        method: "POST",
        body: payload,
      }),
    }),
    getCheckoutSessionStatus: build.query({
      query: (sessionId) => `payments/session-status?session_id=${sessionId}`,
    }),
    getAllLocations: build.query({
      query: () => "locations",
      providesTags: (result, error, id) => [{ type: "Locations", id: "LIST" }],
    }),
    addLocation: build.mutation({
      query: (location) => ({
        url: "locations",
        method: "POST",
        body: {
          name: location.name,
        },
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Locations", id: "LIST" },
      ],
    }),
    addReview: build.mutation({
      query: (review) => ({
        url: "reviews",
        method: "POST",
        body: review,
      }),
      invalidatesTags: (result, error, review) => [
        { type: "Hotels", id: review.hotelId },
        { type: "Reviews", id: review.hotelId },
      ],
    }),
    getReviewsByHotel: build.query({
      query: (hotelId) => `reviews/hotel/${hotelId}`,
      providesTags: (result, error, hotelId) => [
        { type: "Reviews", id: hotelId },
      ],
    }),
    getBookingsByUser: build.query({
      query: ({ userId, status, startDate, endDate, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (status) {
          params.set("status", status);
        }
        if (startDate) {
          params.set("startDate", startDate);
        }
        if (endDate) {
          params.set("endDate", endDate);
        }
        params.set("page", String(page));
        params.set("limit", String(limit));
        const queryString = params.toString();
        return `bookings/user/${userId}${
          queryString ? `?${queryString}` : ""
        }`;
      },
      providesTags: (result, error, args) => [
        { type: "Bookings", id: args?.userId || "LIST" },
      ],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetAllHotelsQuery,
  useGetHotelByIdQuery,
  useGetHotelsBySearchQuery,
  useCreateHotelMutation,
  useCreateBookingMutation,
  useGetBookingByIdQuery,
  useCreateCheckoutSessionMutation,
  useGetCheckoutSessionStatusQuery,
  useAddLocationMutation,
  useGetAllLocationsQuery,
  useAddReviewMutation,
  useGetReviewsByHotelQuery,
  useGetBookingsByUserQuery,
} = api;
