import mongoose from "mongoose";
import validator from "validator"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: false, 
    minLength: [8, "Password should be greater than 8 characters"],
    select: false, 
  },
  phonenumber: {
    type: Number,
    required: false,
    default: null,
    validate: {
      validator: function(v) { 
        return !v || validator.isMobilePhone(v.toString(), 'any');
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
      default: "default_id" 
    },
    url: {
      type: String,
      required: true,
      default: "https://pub-06858b4e7d054a509d532b0b32be0e4c.r2.dev/profile.jpg" 
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "agent"],
    default: "user", 
  },
  loginMethod: {
    type: String,
    enum: ["email_password", "google"],
    default: "email_password"
  },
  paperAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; 
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
