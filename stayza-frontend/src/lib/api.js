const getAllHotels = async () => {
  try {
    // TODO: Make a GET request to the API
    const res = await fetch("http://localhost:8000/api/hotels", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);

    // TODO: Return the data
    return data;
  } catch (error) {
    throw new Error("Failed to fetch Hotel");
  }
};

export { getAllHotels };