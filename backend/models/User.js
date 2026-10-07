import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: String,

  mobile: {
    type: String,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
  },

  role:{
    type:String,
    enum:[
      "admin",
      "supervisor",
      "driver",
      "caretaker"
    ],
    required:true
  },

  // Caretaker ko assigned hostels


  zone: {
    type: String,
    enum: [
      "Hostel Zone 1",
      "Hostel Zone 2",
      "Academic Zone",
      "Colony Zone",
    ],
  },

  locations:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
       default:null
    },

  otp: {
    type: String,
    select: false,
  },

  otpCreatedAt:{
  type:Date,
  default:null,
  select:false
},

  otpAttempts: {
    type: Number,
    default: 0,
    select: false,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  isEmailVerified: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
}
);

export default mongoose.model("User", userSchema);