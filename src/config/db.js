import mongoose from "mongoose";

const ConnectDB =async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)

    }
    catch(error){
        console.log("error in connecting with the database ")
        process.exit(1)
    }
    console.log("database connected successfully")
}

export default ConnectDB