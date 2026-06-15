import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";


dotenv.config();

ConnectDB()
const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send({status:"ok",message:"Server is running smoothly."})
})

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})

