import User from "../models/User.js";
import Location from "../models/Location.js";

const ALLOWED_ROLES = ["supervisor", "driver", "caretaker"];

export const createUser = async (req, res) => {
  try {
    const { name, mobile, email, role,locations,zone  } = req.body;

    if (!name || !mobile || !email) {
      return res.status(400).json({ message: "Name, mobile and email are required" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Mobile or Email already exists",
      });
    }

 const user = await User.create({
  name,
  mobile,
  email,
  role,

  ...(role === "caretaker" && {
    locations,
    zone
  }),

});
    res.status(201).json({
      success: true,
      message: "User Created Successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};




// Get All Users
export const getAllUsers = async (req,res) => {
  try {

    const users = await User.find({
      role: {
        $ne: "admin",
      },
    });

    res.status(200).json(users);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};



// Delete User
// export const deleteUser = async (req,res) => {
//   try {

//     const { id } = req.params;

//     await User.findByIdAndDelete(id);

//     res.status(200).json({
//       message: "User Deleted",
//     });

//   } catch (error) {

//     res.status(500).json({
//       message: "Server error",
//     });

//   }
// };



export const deleteUser = async (req, res) => {
  try {

    const { id } = req.params;


    const user = await User.findById(id);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts can't be deleted"
      });
    }

    if (user.role === "caretaker") {

      await Location.updateOne(
        { caretaker: user._id },
        {
          $set: {
            caretaker: null
          }
        }
      );
    }


    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};
