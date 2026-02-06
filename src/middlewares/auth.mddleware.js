import jwt from "jsonwebtoken"
import User from "../models/User.model.js"



export const protect = async (req,res,next)=>{
    try {
        let token;

        //check if the token is provided
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            //extract from bearer token
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token){
            return res.status(401).json({
                message: "Not authorized, token is missing"
            })
        }

        //verify the token 
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        //find the user by id from decoded
        const user = await User.findById(decoded.id).select("+role");


        if (!user){
            return res.status(401).json({
                message:"User no longer exists"
            })
        }
        //attach user to request
        req.user = user;

        

        next(); // allow to continue

    } catch (error) {
        return res.status(401).json({
            message: "Not authorizes,invalid token"
        })
    }
}



//for checking user role 
export const adminAccess = async(req,res,next)=>{
    try {
        //get the jwt token 

        let token;

        if(
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ){
            token = req.headers.authorization.split(" ")[1] //get the token 
        }

        //check if the token is available
        if (!token){
            return res.status(403).json({
                message:"token missing"
            })
        }
        let decoded;
       try {
        //decode the jwt 
        decoded = jwt.verify(token,process.env.JWT_SECRET)
       } catch (error) {
        return res.json({
            message:"invalid jwt or expired jwt token"
        })
       }


        //user by id 
        const user = await User.findById(decoded.id)

        //check if user exist
        if(!user){
            return res.status(404).json({
                message:"invalid or expired jwt"
            })
        }

        //check the user role 
        if (user.role !=="admin"){
            return res.status(403).json({
                message:"You do not have permission"
            })
        }

        //ataching user to request 
        req.user = user

        next();



    } catch (error) {
        console.log(`error at adminAccess middleware : ${error.message}`)
        res.status(500).json({
            message:error.message
        })
    }
}