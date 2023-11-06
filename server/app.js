import  express from "express";
import cors from "cors"
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import router from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import courseRoutes from "./routes/course.route.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/v1/user',router)
app.use('/api/v1/course',courseRoutes)
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))
app.use(morgan('dev'))
app.use(cookieParser())
app.use('/ping',function(req,res){
    res.send("/pong")
})

//routes of 3 modules
app.use("*",(req,res)=>{
    res.status(404).send('OOPS ! 404 page not found')
})
app.use(errorMiddleware)
export default app;