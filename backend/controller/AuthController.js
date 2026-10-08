import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

const MAX_OTP_TRIES = 5;

const hashOtp = (otp) =>
  crypto
    .createHmac("sha256", process.env.OTP_SECRET || process.env.JWT_SECRET)
    .update(otp)
    .digest("hex");

const sameOtp = (otp, hash) => {
  const a = Buffer.from(hashOtp(String(otp)));
  const b = Buffer.from(hash || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// ======================
// SEND OTP
// ======================

export const sendOtp = async (req, res) => {

try {

const { email } = req.body;

if(typeof email !== "string"){

return res.status(400).json({
success:false,
message:"Email is required"
});

}


const user = await User.findOne({email}).select("+otp +otpCreatedAt");


if(!user){

return res.status(404).json({
success:false,
message:"User not found"
});

}


// ================= OTP EXIST CHECK =================


if(
 user.otp &&
 user.otpCreatedAt
){

const currentTime = new Date();

const diff =
(currentTime - user.otpCreatedAt)
/
(1000 * 60); // minutes


if(diff < 10){

return res.status(200).json({

success:true,

message:
"OTP already sent. Please use previous OTP",

});

}

}



// ================= CREATE NEW OTP =================


const otp = crypto.randomInt(100000, 1000000).toString();



user.otp = hashOtp(otp);

user.otpAttempts = 0;

user.otpCreatedAt = new Date();


await user.save();




// ================= SEND MAIL =================


await axios.post(

"https://api.brevo.com/v3/smtp/email",

{

sender:{
name:"CleanTrack",
email:"jyotipatewar2004@gmail.com"
},


to:[
{
email:user.email,
name:user.name
}
],


subject:"CleanTrack OTP Verification",


htmlContent:`

<div style="font-family:Arial;padding:20px">

<h2>CleanTrack</h2>

<p>Hello <b>${user.name}</b></p>

<p>Your OTP is:</p>

<h1 style="color:green">
${otp}
</h1>

<p>
OTP valid for 10 minutes.
</p>

</div>

`

},

{

headers:{

accept:"application/json",

"api-key":
process.env.BREVO_API_KEY,

"content-type":
"application/json"

}

}

);



return res.status(200).json({

success:true,

message:"OTP Sent Successfully"

});


}

catch(error){

console.log(
error.response?.data ||
error.message
);


return res.status(500).json({

success:false,

message:error.message

});

}


};

// ======================
// VERIFY OTP
// ======================

export const verifyOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    if (typeof email !== "string" || typeof otp !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email }).select("+otp +otpCreatedAt +otpAttempts");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   if(!user.otp || !sameOtp(otp, user.otp)){

  if(user.otp){
    user.otpAttempts = (user.otpAttempts || 0) + 1;

    if(user.otpAttempts >= MAX_OTP_TRIES){
      user.otp = "";
      user.otpCreatedAt = null;
      user.otpAttempts = 0;
    }

    await user.save();
  }

  return res.status(400).json({
    success:false,
    message:"Invalid OTP",
  });

}


// Check OTP expiry

const currentTime = new Date();

const diff =
(currentTime - user.otpCreatedAt) / (1000 * 60);


if(diff > 10){

  return res.status(400).json({
    success:false,
    message:"OTP expired. Please request new OTP."
  });

}

user.isVerified = true;
user.otp = "";
user.otpCreatedAt = null;
user.otpAttempts = 0;

await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      role: user.role,
      id: user._id,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};    