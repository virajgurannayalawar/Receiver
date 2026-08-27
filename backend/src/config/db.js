import mongoose from "mongoose";

const ConnectDB =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)

    }
    catch(error){
        console.error("Error connecting with the database:", error);
        process.exit(1)
    }
    console.log("database connected successfully")
}

export default ConnectDB