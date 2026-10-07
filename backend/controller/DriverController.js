import EmergencyRequest from "../models/EmergencyRequest.js";

// Driver Dashboard - Today's Scheduled Requests
export const getTodayScheduledRequests = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

const requests = await EmergencyRequest.find({
  $or: [
    {
      status: "Scheduled",
      scheduledDate: today,
    },
    {
      isOverdue: true,
      status: { $ne: "Completed" },
    },
  ],
})
.populate("location")
.populate("requestedBy", "name mobile role");
console.log(requests);

const sortedRequests = requests.sort((a, b) => {

  if (a.isOverdue && !b.isOverdue)
    return -1;

  if (!a.isOverdue && b.isOverdue)
    return 1;

 return (
  new Date(a.scheduledDate) -
  new Date(b.scheduledDate)
);
});

   res.status(200).json({
  success: true,
  requests: sortedRequests,
});
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Driver Arrived
export const markAsArrived = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await EmergencyRequest.findOneAndUpdate(
      { _id: id, status: "Scheduled" },
      {
        status: "Arrived",
        arrivedAt: new Date(), // Arrival date & time save
      },
      { new: true }
    )
      .populate("location")
      .populate("requestedBy", "name mobile");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Scheduled request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver arrived at location",
      data: request,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Driver Completed Work

export const markAsCompleted = async(req,res)=>{
try{

const {id}=req.params;


const request =
await EmergencyRequest.findById(id);


if(!request){
return res.status(404).json({
message:"Request not found"
});
}


if(request.status !== "Arrived"){
return res.status(400).json({
message:"First mark arrived"
});
}


request.status="Completed";
request.completedAt=new Date();


await request.save();


res.status(200).json({
success:true,
data:request
});


}catch(error){

res.status(500).json({
message:error.message
});

}

}



export const getCompletedTasks = async (req, res) => {
  try {
    const tasks = await EmergencyRequest.find({
      status: "Completed",
    })
      .populate("location")
      .populate("requestedBy", "name mobile")
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};