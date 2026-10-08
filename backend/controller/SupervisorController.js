import User from "../models/User.js";
import Location from "../models/Location.js";

export const assignZoneToSupervisor = async (req, res) => {
  try {

    const { supervisorId, zone } = req.body;

    const supervisor = await User.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({
        message: "Supervisor not found",
      });
    }

    const locations = await Location.find({
      zone,
    });

    supervisor.zone = zone;



supervisor.zone = zone;
await supervisor.save();

    res.status(200).json({
      success: true,
      message: "Zone Assigned Successfully",
      locationsCount: locations.length,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};





export const getSupervisorLocations = async (req, res) => {
  try {
    const supervisor = await User.findById(req.params.id);

    const locations = await Location.find({
      zone: supervisor.zone,
    });

    res.status(200).json(locations);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};