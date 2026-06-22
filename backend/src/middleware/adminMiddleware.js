import User from "../models/User";


export const isAdmin = async (req, res, next) => {
    try {
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.roles !== "admin") {
            return res.status(403).json({ message: "User is not admin" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
