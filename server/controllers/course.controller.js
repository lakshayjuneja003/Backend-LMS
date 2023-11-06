import Course from "../model/course.model.js"
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
const getAllCourses = async (req,res,next)=>{
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
        success:true,
        message:"All Courses",
        courses
    })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const getLectureByCourseId = async (req,res,next)=>{
    try {
        const { id } = req.params;
        const course = await Course.findById(id)
        if(!course){
            res.status(400).json({
                success:false,
                message:"Course did not found"
            })
        }
        res.status(201).json({
            success:true,
            message:'Course lectures fetched succesfully',
            lectures:course.lectures
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }
}
const createCourse = async (req,res,next)=>{
   try {
    
    const { tittle, description,catagory,createdBy } = req.body
    if(!tittle || ! description || ! catagory || !createdBy){
        return next(new AppError('All fileds are required',400))
    }
    const course = await Course.create({
        tittle,description,category,createdBy,
        thumbnail:{
            public_id:'dummy',
            secure_url:'dummy'
        },
    })
    if(!course){
        return next(new AppError('Course Did not created',400))
    }
    if(req.file){
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms'
        });
        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url
    }
    fs.rm(`uploads/${req.file.filename}`)
    }   
    await course.save()
    res.status(201).json({
        success:true,
        message:"course created succesfully",
        course
    })


   } catch (error) {
    return next(new AppError(error.message || 'Course did not created ',400))
   }
}
const updateCourse = async (req,re,next)=>{
 try {
    const { id } = req.params
    const course = await Course.findByIdAndUpdate(id,
        {$set:req.body},{runValidators :true})
    if(!course){
        return next(new AppError('Course with given id does not exist',400))
    }
    res.status(201).json({
        success:true,
        message:'Course Updated Succesfully',
        course
    })
 } catch (error) {
        return next(new AppError(error.message , 400))
    }
}
const removeCourse = async (req,res,next)=>{}
export {
    getAllCourses,
    getLectureByCourseId,createCourse,updateCourse,removeCourse
}