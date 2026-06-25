import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import authroutes from "./routes/authroutes.js"
import banCheckMiddleware from "./middleware/banCheckMiddleware.js";
dotenv.config();

ConnectDB()
const app = express();

app.use(cors());
app.use(express.json());
app.use(banCheckMiddleware)
app.get("/",(req,res)=>{
    res.send({status:"ok",message:"Server is running smoothly."})
})

app.use('/auth',authroutes)

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})

