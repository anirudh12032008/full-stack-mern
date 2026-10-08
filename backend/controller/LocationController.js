import Location from "../models/Location.js";
import User from "../models/User.js";

export const createLocation = async (req, res) => {
  try {
    const { locationName, zone, latitude, longitude } = req.body;

    // Check if location already exists
    const existingLocation = await Location.findOne({
      locationName: locationName.trim(),
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: `Location "${locationName}" is already assigned to ${existingLocation.zone}`,
      });
    }

    const location = await Location.create({
      locationName,
      zone,
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.log("CREATE LOCATION ERROR =>", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();

    res.status(200).json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};






export const getLocationsByZone = async (req, res) => {
  try {
    const { zone } = req.params;


    const supervisor = await User.findOne({
      role: "supervisor",
      zone,
    });


const locations = await Location.find({ zone })
  .populate("caretaker", "name mobile");

    res.status(200).json({
      success: true,
      supervisor: supervisor?.name,
      zone,
      locations,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const getSingleLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.status(200).json({
      success: true,
      location,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationName, zone, latitude, longitude } = req.body;

    if (typeof locationName !== "string" || !locationName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required",
      });
    }

    const existingLocation = await Location.findOne({
      locationName: locationName.trim(),
      _id: { $ne: id },
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: `Location "${locationName}" is already assigned to ${existingLocation.zone}`,
      });
    }

    const updated = await Location.findByIdAndUpdate(
      id,
      { locationName: locationName.trim(), zone, latitude, longitude },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: updated,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    await Location.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};