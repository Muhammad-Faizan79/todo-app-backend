import express, { json, response } from "express";
import mongoose from "mongoose";
import userModel from "./model/user.js";
import cors  from "cors";
import todoModel from "./model/todo.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
import {setServers} from "node:dns/promises"
setServers(["8.8.8.8","1.1.1.1"])
dotenv.config()



const app = express();
const Port = process.env.PORT;
const URL = process.env.mogo_uri
mongoose.connect(URL)
.then(()=>console.log("MogoDB Conected"))
.catch((error)=>console.log(error))


app.use(express.json())
app.use(cors())

app.post("/create-user" ,async(req , res)=>{
    try {    

        

        const { fullName , email , password} = req.body
        if(!fullName || !email || !password){
            res.json({
                message: "required filled or missing",
                status:false
            })
            return    
        }       


        const dbData = await userModel.findOne({email});
        
        if(dbData){
            res.json({
                message: "emial alrady exit",
                status:false
            })
        }
        
        const hashPassword = await bcrypt.hash(req.body.password , 10)

        const obj={
            ...req.body,
            password:hashPassword
        }
        await userModel.create(obj)
            res.json({
                message: "user singup success fully",
                status:true
            })

    } catch (error) {
        
        res.json({
                message:  error.message,
                status:false
            })
    }
    
    
    


})


app.post("/login",  async(req , res)=>{
try {    

        

        const {  email , password} = req.body
        if( !email || !password){
            res.json({
                message: "required filled or missing",
                status:false
            })
            return    
        }       


        const dbData = await userModel.findOne({email}); 

        
        if(!dbData){
            res.json({
                message: "email or passowrd enquracted",
                status:false
            })
            return
        }
        const compare = await bcrypt.compare(req.body.password ,dbData.password )
        // console.log("compare" , dbData)
     if(compare){
        // console.log(dbData)

        const jwtToken = jwt.sign(
            {
                id:dbData._id,
                fullName:dbData.fullName
            },
            "Faizan@12"
        )
        
        console.log("token" , jwtToken)
        res.json({
            message :"login User Successfully",
            status:true,
            token: jwtToken
        })
     }else{ 
        res.json({
            message :"invalid password or emial ",
            status:false
        })
     }

    } catch (error) {
        // console.log(error.message)
        res.json({
                message:error.message,
                status:false
            })
    }



})


app.get("/singleUser/:id" , async(req , res)=>{

    try {
        const UserId  = req.params.id;
        const curentUser = await userModel.findById(UserId);
        res.json({
            message :"fetch singleUser",
            status : true,
            data:curentUser
        })
    } catch (error) {
        res.json({
            message:error.message || "somthing went wrong",
             status:false,
            data: null
        })
        
    }
    
})

const isAuth =  async(req , res , next)=>{
    // next()
    // console.log(req.headers.authorization.split(".")[1])
    const header = req.headers.authorization;
    if(!header){
          res.json({
            message: "unAuth user",
            status:false
    })
    }
    const token = header.split(" ")[1]
    try {
    
    const verifyJwt = jwt.verify(token ,process.env.jwt_segret_key )
    
        req.userId = verifyJwt.id;
        next()
        
        
    } catch (error) {
     return res.json({
            message: "unAuth user",
            status:false
    })}
}    
 
    
app.post("/todo" , isAuth, async (req , res)=>{
    try {
        // console.log(" req.body", req.body)
        const body = req.body
        console.log(body)
        await todoModel.create({...body , userId: req.userId})
        res.json({
            message:"created Todo",
            status:true
        })

        
    } catch (error) {
           res.json({
            message: error.message,
            status:false
        })
        
    }
})
app.get("/todo" , isAuth, async (req , res)=>{
    try {
        const todoId = req.query.todoId
        // console.log(todoId)
        if(todoId){
            const todo = await todoModel.findById(todoId)
            res.json({
                message:"fetch single Todo",
                status:true,
                todoData: todo
            })
        }else{
            console.log()
            const allTodo = await todoModel.find({userId: req.userId})
            res.json({
                message:"fetch all Todos",
                status:true,
                todoData: allTodo
            })
        }
    } catch (error) {
        res.json({
                message:error.message,
                status:false,
                todoData: null
            })  
    }
})
app.put("/todo/:id" , isAuth, async (req , res)=>{
    try{
    const id = req.params.id;
    
     const {task , dueDate} = req.body
    
     if(!task || !dueDate){
       return res.json({
            message:"requied filed or messing",
            status:false
        })
    }
    // console.log(id)
    const todo = await todoModel.findByIdAndUpdate(id,req.body)
    
    
        res.json({
            message:"update todo successfully",
            status:true
        })
    
}catch(error){
        res.json({
            message:error.message || "error smothing wontsrong",
            status:false
        })
    }
})
app.delete("/todo/:id" , isAuth, async (req , res)=>{
    try {
        const id = req.params.id;
    if(!id){
    return res.json({
            message:"id is messing",
            status: false
        })
    }
    await todoModel.findByIdAndDelete(id)

    res.json({
        message:"Deleted todo",
        status:true
    })
    } catch (error) {
      res.json({
        message:error.message || "your id is messing ",
        status:false
    })  
    }
})


app.post("/complet/:id", isAuth , async (req , res)=>{
try {
    const id = req.params.id
    if(!id){
        return res.json({
            message:"somthing want rong",
            status:false
        })
    }

    
    const todo =await todoModel.findByIdAndUpdate(id,{status:"completed"},{returnDocument:"after"})
    if(todo.status === "completed"){
        res.json({
      message:"update todo",
      status:true  
    })
    }else{
      res.json({
      message:"somthing wonts rong",
      status:false  
    })  
    }
    
} catch (error) {
    console.log(error.message)
}
})




app.listen(Port ,()=> console.log(`sever is runing on port http://locahost:${Port}`))


