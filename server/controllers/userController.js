import User from "../model/userSchema.js"
import AppError from "../utils/error.utils.js"
import cloudinary from "cloudinary"
import fs from 'fs/promises'
import crypto from 'crypto'
const cookieOptions = {
  maxAge:7*24*60*60*1000,// for 7 days
  httpOnly:true,
  secure:true
}

const register = async (req,res,next)=>{
  const {Fullname, email ,password} = req.body
  if(!Fullname|| !email || !password){
    return next(new AppError('All Field are Required',400))
  }
  const userExists = await User.findOne({ email })
  if(userExists){
      return next(new AppError('Email already exists',400))
  }

  const user = await User.create({
    Fullname,
    email,
    password,
    avatar:{
      public_id: email ,
      secure_url:
      'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg'
    }
  })
  if(!user){
    return next(new AppError('user registration failed,please try again',400))
  }
     
  if(req.file){
    console.log(req.file);
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder:"lms",
        width:250,
        height:250,
        gravity:"faces",
        crop:"fill"
      })
       if(result){
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        // removing the file from server
        fs.rm(`uploads/${req.file.filename}`)
       }
    } catch (error) {
      return next (
        new AppError(error || 'file not uploaded', 500)
      )
    }
  }

  await user.save();
  user.password = undefined
  const token = await user.genrateJWTToken();

  res.cookie('token',token, cookieOptions)
  res.status(201).json({
    sucess:true,
    message:'User Registration sucessfully',
    user,
  })
}
const login = async (req,res)=>{
   try {
    const {email,password} = req.body

    if(!email || !password){
      return next(new AppError('All Field Are Required',400))
    }
    const user = await userSchema.findOne({
      email
    }).select('+password');

    if(!user|| !user.comparePassword(password)){
      return next(new AppError('Email And Password Doesn"t Match',400))

    }
    const token = await user.genrateJWTToken();
    user.password = undefined
    res.cookie('token',token,cookieOptions)

    res.status(200).json({
      sucess:true,
      message:'user logged in succesfully',
      user
    })
   } catch (error) {
    return next(new AppError(error.message,500))
   }
}
const logout = async (req,res)=>{
    res.cookie('token', null ,{
      secure:true,
      maxAge:0,
      httpOnly:true
    })
    res.status(200).json({
      sucess:true,
      message:"user logged out successfully"
    })
}
const getProfile = async (req,res)=>{
   try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      success:true,
      message:"user details",
      user,
    })
   } catch (error) {
    return next(new AppError('Failed To fetch user details',400))
   }
    
}
const ForgotPassword = async (req,res,next)=>{
  const {email} = req.body
  if(!email){
    return next(new AppError('Email is required', 400))
  }

  const user = await User.findOne({email})
  if(!user){
    return next(new AppError('Email Not Registerd', 400))
  }
  const resetToken = await user.genratePasswordResetToken();

  await user.save()
  const resetPasswordURL = `${Process.env.FRONTEND_URL}/reset-password/${resetToken}`
  const message = `You can reset you password by clicking <a href=${resetPasswordURL} target="_blank > Reset your Password </a> \n if the above link does not work for some reason copy paste this link in new tab ${resetPasswordURL}"`
  const subject = 'Reset Password'

  try {
    await sendEmail(email , subject, message)
    res.status(200).json({
      success:true,
      message:`reset Password token has been sent to ${email} successfully`
      
    })
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();
    return next(new AppError(error.message,500))
  }
}
const ResetPassword = async (req,res,next)=>{
  const {resetToken } = req.params
  const { password } = req.body;
 
  const forgotPasswordToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')
  const user = await User.findOne({forgotPasswordToken,forgotPasswordExpiry:{$gt :Date.now()}});
  if(!user){
    return next(new AppError('Token is invalid or expired , please try again ', 400))
  }
  user.password = password
  user.forgotPasswordToken = undefined
  user.forgotPasswordExpiry = undefined
  user.save();
  res.status(200).json({
    success:true,
    message:'password changed succesfully'
  })

}
const changePassword = async (req,res)=>{
  const { oldPassword , newPassword} = req.body
  const { id } = req.user
  if(!oldPassword || !newPassword) {
    return next(new AppError('All fields are mendatory',400))
  }
  const user = await User.findById(id).select('+password')
  if(!user){
    return next(new AppError("user doesn't exist", 400))
  }
  const isPasswordvalid = await user.comparePassword(oldPassword)
  if(!isPasswordvalid){
    return next(new AppError('Invalid Old Password'))
  }
  user.password = newPassword
  await user.save()
  user.password = undefined
  res.status(201).json({
    success:true,
    message:"Password changed succesfully"
  })
}
const updateUser = async (req,res,next)=>{
   const {fullname} = req.body;
   const { id } = req.user.id;

   const userExists = await User.findById(id);
   if(!user){
    return next(new AppError('User doesnt exist ', 400))
   }
   if(req.fullname){
    user.fullname = fullname;
   }
   if(req.file){
    // destroying the avatar
    await cloudinary.v2.uploader.destroy(user.avatar.public_id)
    // updating the avatar 
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder:"lms",
        width:250,
        height:250,
        gravity:"faces",
        crop:"fill"
      })
       if(result){
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;
        // removing the file from server
        fs.rm(`uploads/${req.file.filename}`)
       }
    } catch (error) {
      return next (
        new AppError(error || 'file not uploaded', 500)
      )
    }
  
   }
   await user.save()
   res.status(201).json({
    success:true,
    message:"User deatils Saved Succesfully"
   })
}
export {
    register,
    login,
    logout,
    getProfile,
    ForgotPassword,
    ResetPassword,
    changePassword,updateUser
}