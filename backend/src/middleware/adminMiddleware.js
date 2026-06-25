import User from "../models/User.js";



export const isAdmin = async (req, res, next) => {
    try {
        
        let user = await User.findById(req.id);
        if(!user){

            user = new User({roles:"abcd"})
        } 
        if (user.roles == "admin"||req.role =="admin") {
            return res.status(403).json({ message: "User is not admin" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
