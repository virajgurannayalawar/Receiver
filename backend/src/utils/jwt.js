import jwt from "jsonwebtoken"

export const generateToken=(user)=>{
const payload = {
  id: user._id,       // 1. The database ID (Crucial for looking up real-time data)
  email: user.email,   // 2. User identification (Handy for frontend profile displays)
  role: user.roles,    // 3. System permissions (To instantly block standard users from admin panels)
  token_version: user.token_version || 0 // 4. Optional Security Field (Explained below)
};

return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"7d"});

}

export const verifyToken =async(token)=>{
  try {
    return jwt.verify(token,process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return null;
  }
}