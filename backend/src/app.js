import http from "http"
import express from "express";
import {Server} from "socket.io"
import cors from "cors";
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import authroutes from "./routes/authroutes.js"
import uploadroutes from "./routes/uploadroutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import banCheckMiddleware from "./middleware/banCheckMiddleware.js";
dotenv.config();

ConnectDB()
const app = express();

const server=http.createServer(app)
const io=new Server(server,{
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  }
})
io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("message", (msg) => {
        console.log(msg);

        io.emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("User left");
    });
});
app.set("io",io)
app.use(cors(
    {
        origin:"http://localhost:5173",
        credentials:true
    }
));
app.use(cookieParser());
app.use(express.json());
// app.use(banCheckMiddleware)
app.get("/",(req,res)=>{
    res.send({status:"ok",message:"Server is running smoothly."})
})

app.use('/auth',authroutes)
app.use('/upload-signature',uploadroutes)



app.use('/request',orderRoutes)


server.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})

