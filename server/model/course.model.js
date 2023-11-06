import { Schema ,model } from "mongoose";
const courseSchema = new Schema({
    tittle:{
        type:'String',
        required:[true,"Tittle is required"],
        minLength:[8,'Tittle must be atleast 8 characters'],
        maxLength:[200,'Tittle should not be more than 200 characters'],
        trim:[true]
    },
    description:{
        type:'String',
        required:[true,"description is required"],
        minLength:[8,'description must be atleast 8 characters'],
        maxLength:[200,'description should not be more than 200 characters']
    },
    category:{
        type:'String',
        required:[true,"category is required"],
    },
    thumbnail:{
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        }
    },
    lectures:[
        {
            tittle:String,
            description:String,
            lecture:{
                public_id:{
                    type:String,
                },
                secure_url:{
                    type:String,
                }
            }
        }
    ],
    numberOfLectures:{
        type:Number,
        default : 0,
    },
    createdBy:{
        type:String,
        required:[true,"Author name is required"]
    }
},{
    timestamps:true
})
const Course = model('Course',courseSchema)
export default Course;