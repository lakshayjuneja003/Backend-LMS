import mongoose, { Schema } from "mongoose";

mongoose.set('strictQuery',false)

const connectTodb = async ()=>{
   try {
     await mongoose.connect(
        process.env.MONGO_URI || `mongodb://0.0.0.0/LMS`
        )
    .then((conn)=>{console.log(`server connected to db :${conn.connection.host}`)})
    .catch((error)=>{
        console.log(`server not connected ${error} `)
    })
   } catch (error) {
    console.log(error)
    process.exit(1)
   }
}
export default connectTodb;