import mongoose, { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'
const userSchema = new Schema({
    Fullname:{
        type:'String',
        required: [true,'Name is required'],
        minlength:[5,'Name must be of 5 character'],
        maxLength:[50,'Name should be less than 50 charcters'],
        trim:true
    },
    email:{
        type:'String',
        required:[true,'Email is required'],
        lowecase:true,
        trim:true,
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+.)+[a-zA-Z]{2,}))/,
            'please fill in a valid email address'
        ]
    },
    password:{
        type:'String',
        required:[true,'password is required'],
        minlength:[8,'password must be atleast 8 charcters'],
        select:false
    },
    avatar:{
        public_id:{
        type:'String',
        },
        secure_url:{
        type:'String'
        }
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:"USER"
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date
    },
    {
        timestamps:true
}
)
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password,8)
})
userSchema.methods = {
    genrateJWTToken : async function(){
        return await jwt.sign(
            {id:this._id, email:this.email,Subscription:this.Subscription,role:this.role},
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_EXPIRY
            }
        )
    },
    comparePassword : async function(plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password)
    },
    genratePasswordResetToken : async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto.creteHash('sha256').update(resetToken).digest('hex')
        this.forgotPasswordExpiry = Date.now() + 15*60*1000; // valid for 15 minutes
    }
}
const User = model('user',userSchema)

export default User;