import EmergencyRequest from "../models/EmergencyRequest.js";
import User from "../models/User.js";
import Location from "../models/Location.js";

export const createEmergencyRequest = async (req, res) => {
  try {
    const { location, priority } = req.body;
    const requestedBy = req.user.id;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    // Supervisor Check
    const supervisor = await User.findById(requestedBy);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        message: "Supervisor not found",
      });
    }

    // Location Check
    const selectedLocation = await Location.findById(location);

    if (!selectedLocation) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // Zone Validation
    if (selectedLocation.zone !== supervisor.zone) {
      return res.status(403).json({
        success: false,
        message: "This location is not assigned to your zone",
      });
    }

    // Active Request Check
    const activeRequest = await EmergencyRequest.findOne({
      location,
      status: {
        $in: [
          "Pending",
          "Accepted",
          "Scheduled",
          "Arrived",
        ],
      },
    });

    if (activeRequest) {
      return res.status(400).json({
        success: false,
        message:
          "⚠️ This location already has an active request. Wait until it is completed.",
      });
    }

    // Queue Number
    const lastRequest =
      await EmergencyRequest.findOne().sort({
        queueNumber: -1,
      });

    const queueNumber = lastRequest
      ? lastRequest.queueNumber + 1
      : 1;

    // Create Request
    const request = await EmergencyRequest.create({
        requestedBy,
        location,
        priority: priority || "High",
        queueNumber,
      });

    const populatedRequest = await EmergencyRequest.findById(request._id)
        .populate(
          "requestedBy",
          "name mobile role zone"
        )
        .populate("location");

    return res.status(201).json({
      success: true,
      message:
        "Pickup request created successfully",
      data: populatedRequest,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getAllEmgReq = async (req, res) => {
  try {

    const today = new Date()
      .toISOString()
      .split("T")[0];

   await EmergencyRequest.updateMany(
  {
    status: "Scheduled",
    scheduledDate: { $lt: today },
  },
  {
    $set: {
      isOverdue: true,
    },
  }
);

    const emgReqs = await EmergencyRequest.find()
      .populate("requestedBy", "name mobile role")
      .populate("location")
      .populate("assignedDriver", "name mobile role")
      .sort({
        createdAt: -1,
      });
  const sorted = emgReqs.sort((a, b) => {

  if (a.isOverdue && !b.isOverdue)
    return -1;

  if (!a.isOverdue && b.isOverdue)
    return 1;

  return 0;
});

    res.status(200).json({
      success: true,
      message: "All Emergency Requests",
      count: sorted.length,
      data: sorted,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });

  }
};


export const updateScheduleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, scheduledTime } = req.body;

   const request = await EmergencyRequest.findByIdAndUpdate(
  id,
  {
    scheduledDate,
    scheduledTime,
    status: "Scheduled",
    isOverdue: false,
  },
  { new: true }
);

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getMyEmergencyRequests = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    const requests = await EmergencyRequest.find({
      requestedBy: supervisorId,
    })
      .populate("location")
      .populate("requestedBy")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





export const getZoneCaretakerRequests = async(req,res)=>{

try{


const {supervisorId}=req.params;



const supervisor = await User.findById(supervisorId);



const locations = await Location.find({
    zone: supervisor.zone
});



const locationIds = locations.map(
    loc => loc._id
);




const caretakers = await User.find({
    role:"caretaker",
    locations:{
        $in:locationIds
    }
});




const requests = await EmergencyRequest.find({
 location:{
   $in:locationIds
 }
})
.populate({
 path:"requestedBy",
 select:"name mobile role"
})
.populate("location")
.sort({
 createdAt:-1
});




return res.json({
    success:true,
    caretakers,
    data:requests
});


}
catch(error){

console.log("ERROR:",error);

res.status(500).json({
success:false,
message: "Server error"
});

}

}