import { Router } from 'express'
import {getLectureByCourseId,getAllCourses,createCourse,updateCourse,removeCourse} from '../controllers/course.controller.js'
import {isLoggedIn} from "../middlewares/auth.middleware.js"
const courseRoutes = Router();
import upload from '../middlewares/multer.middleware.js'

courseRoutes.route('/')
    .post(upload.single('thumbnail'),createCourse)
    .get(isLoggedIn,getAllCourses)

courseRoutes.route('/:id')
    .get(isLoggedIn,getLectureByCourseId)
    .delete(removeCourse)
    .put(updateCourse)
export default courseRoutes;