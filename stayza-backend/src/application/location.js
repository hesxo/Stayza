import Location from "../infrastructure/entities/Location.js";

export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).send();
  }
};

export const createLocation = async (req, res) => {
  try {
    const locationData = req.body;
    if (!locationData.name) {
      res.status(400).send();
      return;
    }

    const existing = await Location.findOne({ name: locationData.name });
    if (existing) {
      res.status(200).json(existing);
      return;
    }

    const created = await Location.create({ name: locationData.name });
    res.status(201).json(created);
  } catch (error) {
    const isDuplicate =
      (error && error.code === 11000) ||
      (error && error.name === "MongoServerError" && error.message && error.message.includes("E11000")) ||
      (error && typeof error.message === "string" && error.message.toLowerCase().includes("duplicate key"));

    if (isDuplicate) {
      const existing = await Location.findOne({ name: req.body?.name });
      if (existing) {
        res.status(200).json(existing);
        return;
      }
      res.status(409).json({ message: "Location already exists" });
      return;
    }

    console.error("Error creating location:", error);
    res.status(500).send();
  }
};

export const getLocationById = async (req, res) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      res.status(404).send();
      return;
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).send();
  }
};

export const updateLocation = async (req, res) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      res.status(400).send();
      return;
    }

    const location = await Location.findById(_id);
    if (!location) {
      res.status(404).send();
      return;
    }

    await Location.findByIdAndUpdate(_id, locationData);
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

export const patchLocation = async (req, res) => {
  try {
    const _id = req.params._id;
    const locationData = req.body;
    if (!locationData.name) {
      res.status(400).send();
      return;
    }
    const location = await Location.findById(_id);
    if (!location) {
      res.status(404).send();
      return;
    }
    await Location.findByIdAndUpdate(_id, { name: locationData.name });
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const _id = req.params._id;
    const location = await Location.findById(_id);
    if (!location) {
      res.status(404).send();
      return;
    }
    await Location.findByIdAndDelete(_id);
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
}; 