// const app = require('./app.js')
import app from "./app.js"
// import app from "./app.js"
// const { config }= require('dotenv')
import { config } from 'dotenv';
import connectTodb from "./config/db.config.js";
config();
const PORT = process.env.PORT ||5000;
// cloudinary confriguation
import {v2 as cloudinary} from 'cloudinary';    
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_KEY, 
  api_secret: process.env.CLOUD_KEY_API 
});
app.listen(PORT, async ()=>{
    await connectTodb();
    console.log(`server is running at http://localhost:${PORT}`)
})
