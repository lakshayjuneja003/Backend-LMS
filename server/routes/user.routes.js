import { Router } from "express";
import { register,login ,logout ,getProfile,ForgotPassword , ResetPassword,changePassword,updateUser} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router()

router.post('/register',upload.single("avatar"),register)
router.post('/login',login)
router.get('/logout',logout)
router.post('/me',isLoggedIn,getProfile)
router.post('/forgotPassword',ForgotPassword)
router.post("/reset-password",ResetPassword)
router.post('/change-password',isLoggedIn,changePassword)
router.put("/update/:id",isLoggedIn , upload.single("avatar"), updateUser)
export default router;