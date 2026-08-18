import mongoose from "mongoose";

const todoschema = new mongoose.Schema({
    task:String,
    dueDate:String,
    status:{
        type:String,
        default: "pending"
    },
    userId:{
        type:String
    },
    categories:{
        type:String
    }
    
},{timestamps:true})

const todoModel = mongoose.model("todo",todoschema)
export default todoModel