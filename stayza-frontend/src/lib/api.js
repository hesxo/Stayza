const getAllHotels = async () => {
  // TODO: Make a GET request to the API\
  const res = await fetch("http://localhost:8000/api/hotels", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  console.log(data);


  //   console.log("A");
  //   fetch("http://localhost:8000/api/hotels", {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => {
  //       console.log(res);
  //       return res.json();
  //     })
  //     .then((data) => {
  //       console.log(data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   console.log("B");
  // TODO: Return the data
  return data;
};

export { getAllHotels };