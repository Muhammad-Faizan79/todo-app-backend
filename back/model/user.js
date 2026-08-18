import mongoose from "mongoose";
const userSchema =new mongoose.Schema({
    fullName :String,
    email :String,
    password: String
})
const userModel = mongoose.model("worker" ,userSchema)
export default userModel