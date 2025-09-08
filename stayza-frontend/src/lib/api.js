import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
  endpoints: (build) => ({
    getAllHotels: build.query({
      query: () => 'hotels',
    }),
    addLocation: build.mutation({
      query: (location) => ({
        url: 'locations',
        method: 'POST',
        body: {
          name: location.name,
        },
      }),
    }),
    getAllLocations: build.query({
      query: () => 'locations',
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetAllHotelsQuery, useAddLocationMutation, useGetAllLocationsQuery } = api