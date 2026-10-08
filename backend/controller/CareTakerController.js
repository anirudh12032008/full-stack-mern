import User from "../models/User.js";
import Location from "../models/Location.js";
import EmergencyRequest from "../models/EmergencyRequest.js";

const STATUSES = ["Pending","Scheduled","Arrived","Completed"];


export const assignHostelToCaretaker = async(req,res)=>{

try{

const {caretakerId, locationId}=req.body;




// caretaker check
const caretaker = await User.findById(caretakerId);


if(!caretaker)
{
return res.status(404).json({
success:false,
message:"Caretaker not found"
});
}


if(caretaker.role !== "caretaker")
{
return res.status(400).json({
success:false,
message:"User is not caretaker"
});
}



// CHECK CARETAKER ALREADY ASSIGNED
const alreadyAssigned = await Location.findOne({caretaker: caretakerId});


if(alreadyAssigned)
{
return res.status(400).json({
success:false,
message:`Caretaker already assigned to ${alreadyAssigned.locationName}`
});
}



// location check
const location = await Location.findById(locationId);


if(!location)
{
return res.status(404).json({
success:false,
message:"Hostel not found"
});
}


// check hostel already has caretaker
if (location.caretaker) {

  const existingCaretaker = await User.findById(location.caretaker);

  // Agar caretaker abhi bhi exist karta hai
  if (existingCaretaker) {
    return res.status(400).json({
      success: false,
      message: "This hostel already has caretaker"
    });
  }

  // Agar caretaker delete ho chuka hai to reference hata do
  location.caretaker = null;
  await location.save();
}



// assign

location.caretaker = caretakerId;

await location.save();


caretaker.locations = locationId;
caretaker.zone = location.zone;

await caretaker.save();

res.status(200).json({

success:true,
message:"Hostel assigned successfully"

});


}
catch(error)
{

console.log("ASSIGN ERROR:",error);

res.status(500).json({
success:false,
message: "Server error"
});

}

};









export const getCaretakerRequests = async(req,res)=>{

try{

const {caretakerId}=req.params;


const caretaker = await User.findById(caretakerId)
.populate("locations");


if(!caretaker)
{
return res.status(404).json({
success:false,
message:"Caretaker not found"
});
}



const hostelId = caretaker.locations?._id;



if(!hostelId)
{
return res.status(400).json({
success:false,
message:"No hostel assigned to caretaker"
});
}



const filter = {location: hostelId};



if(STATUSES.includes(req.query.status))
{
filter.status=req.query.status;
}



if(req.query.overdue==="true")
{
filter.isOverdue=true;
}




const requests = await EmergencyRequest.find(filter)

.populate(
"location",
"locationName zone"
)

.populate(
"assignedDriver",
"name mobile"
)

.sort({
createdAt:-1
});




res.status(200).json({

success:true,

count:requests.length,

data:requests

});


}
catch(error){

console.log("CARETAKER REQUEST ERROR:",error);

res.status(500).json({

success:false,

message: "Server error"

});
}
};





export const getAllCaretakers = async(req,res)=>{

try{

const caretakers = await User.find({
 role:"caretaker"
})
.select("name mobile");


res.status(200).json({
 success:true,
 data:caretakers
});


}
catch(error){
console.error(error);

res.status(500).json({
 success:false,
 message: "Server error"
});
}
};




// UPDATE CARETAKER ASSIGNMENT
export const updateCaretakerHostel = async (req, res) => {

  try {

    const { locationId, caretakerId } = req.body;


    if (!locationId || !caretakerId) {
      return res.status(400).json({
        success:false,
        message:"Location and caretaker are required"
      });
    }



    // new caretaker check

    const newCaretaker = await User.findById(caretakerId);


    if(!newCaretaker){
      return res.status(404).json({
        success:false,
        message:"Caretaker not found"
      });
    }


    if(newCaretaker.role !== "caretaker"){
      return res.status(400).json({
        success:false,
        message:"User is not caretaker"
      });
    }





    // hostel check

    const location = await Location.findById(locationId);


    if(!location){
      return res.status(404).json({
        success:false,
        message:"Hostel not found"
      });
    }




    // Check new caretaker already assigned to another hostel

    const caretakerAlreadyAssigned = await Location.findOne({
      caretaker: caretakerId,
      _id:{
        $ne: locationId
      }
    });



    if(caretakerAlreadyAssigned){

      return res.status(400).json({
        success:false,
        message:
        `Caretaker already assigned to ${caretakerAlreadyAssigned.locationName}`
      });

    }





    // remove old caretaker from this hostel

    const oldCaretakerId = location.caretaker;



    if(oldCaretakerId){

      const oldCaretaker = await User.findById(oldCaretakerId);


      if(oldCaretaker){

        oldCaretaker.locations = null;

        await oldCaretaker.save();

      }

    }





    // assign new caretaker to hostel

    location.caretaker = caretakerId;

    await location.save();





    // update new caretaker

    newCaretaker.locations = locationId;

    await newCaretaker.save();





    res.status(200).json({

      success:true,
      message:"Caretaker updated successfully",
      data:location

    });



  }
  catch(error){

    console.log("UPDATE CARETAKER ERROR:",error);


    res.status(500).json({
      success:false,
      message: "Server error"
    });

  }

};






// GET CARETAKER ASSIGNED HOSTEL

export const getCaretakerHostel = async(req,res)=>{

try{

const {caretakerId}=req.params;


const caretaker = await User.findById(caretakerId)
.populate("locations");


if(!caretaker){

return res.status(404).json({
success:false,
message:"Caretaker not found"
});

}


if(!caretaker.locations){

return res.status(400).json({
success:false,
message:"No hostel assigned"
});

}


res.status(200).json({

success:true,
data:caretaker.locations

});


}
catch(error){
console.error(error);

res.status(500).json({
success:false,
message: "Server error"
});

}

};





// CREATE CARETAKER PICKUP REQUEST

export const createCaretakerRequest = async(req,res)=>{

try{


const caretakerId = req.user.id;

const {priority}=req.body;



// caretaker find

const caretaker = await User.findById(caretakerId);



if(!caretaker){

return res.status(404).json({
success:false,
message:"Caretaker not found"
});

}



if(caretaker.role !== "caretaker"){

return res.status(403).json({
success:false,
message:"Invalid caretaker"
});
}




// assigned hostel

const hostelId = caretaker.locations;



if(!hostelId){

return res.status(400).json({
success:false,
message:"No hostel assigned"
});

}




// active request check

const activeRequest =
await EmergencyRequest.findOne({

location:hostelId,

status:{
$in:["Pending","Scheduled","Arrived"]
}
});



if(activeRequest){

return res.status(400).json({
success:false,
message:
"This hostel already has active request"
});
}





// CREATE REQUEST

const request = await EmergencyRequest.create({

requestedBy:caretakerId,

location:hostelId,

priority:priority || "Medium"

});





const data = await EmergencyRequest.findById(request._id)

.populate(
"location",
"locationName zone"
)

.populate(
"requestedBy",
"name mobile role"
);





return res.status(201).json({
success:true,
message: "Pickup request created successfully", data
});


}
catch(error){

console.log(error);

return res.status(500).json({
success:false,
message: "Server error"
});
}
};