import bcrypt from "bcrypt"
import crypto from "crypto"
import streamifier from "streamifier"
import jwt from "jsonwebtoken"

import User from "../models/User.model.js"
import AdminStaffTokenRecorde from "../models/AdminStaffToken.model.js"

import { sendVerificationEmail,sendPasswordResetLinkEmail } from "../services/email.service.js"
import { emailQueue } from "../queue/emailQueue.js"
import { getCache,setCache,deleteCacheByPattern } from "../utils/cache.js"

import cloudinary from "../config/cloudinary.js"



//register user 
export const registerUser = async(req,res)=>{
    try {
        const {username,email,phone,password,address} = req.body;

        //basic validation 

        if (!username || !email || !password){
            return res.status(400).json({
                message: "required fields missing",
            });
        }

        //prevent duplicate registration 
        const exists = await User.findOne({email});

        if (exists){
            return res.status(409).json({
                message:"email already registered"
            })
        }

        //hash password 

        const hashedPassword = await bcrypt.hash(password,10);


        //upload profile picture if provided 

        let porfilePicUrl = null;

        if (req.file){
            const uploadImage = ()=>{
                return new Promise((resolve,reject)=>{
                    const stream = cloudinary.v2.uploader.upload_stream(
                        {folder:"profile_pic"},
                        (err,result)=> (result ? resolve(result) : reject(err))
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            }

            const result = await uploadImage();
            porfilePicUrl = result.secure_url;
        }

        //generate email verification token 

        const token = crypto.randomBytes(32).toString("hex");

        //create inactive user 

        const user = await User.create({
            username,
            email,
            phone,
            password:hashedPassword,
            address,
            profile_pic: porfilePicUrl,
            emailVerifyToken:token,
            emailVerifyExpires: Date.now() + 15 *60*1000
        })

        //create verify link  

        const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email/${token}`

        //send verification email 

        await sendVerificationEmail(email,verifyLink);

        res.status(201).json({
        message: "Registration successful. Check your email to verify account."
        });
            
    } catch (error) {
        console.log("server error at register user funtion ",error.message);
        console.log(`clodinary api key : ${process.env.CLOUDINARY_API_KEY}`)
        res.status(500).json({message:"server error"})
    }
}


//verify email 
export const verifyEmail = async (req,res)=>{
    try{
        const {token} = req.params;
        //find user with valid token 
        const user = await User.findOne({
            emailVerifyToken:token,
            emailVerifyExpires:{$gt: Date.now()}
        });

        if (!user){
            return res.status(400).json({message: "Invalid or expired token"});

        }

        // activate account 

        user.isActive = true;
        user.emailVerifyToken = undefined;
        user.emailVerifyExpires = undefined;

        await user.save();

        res.json({message: "Account verified successfully"});


    }catch(error){
        console.log("error at verifying email ",error.message)
        res.status(500).json({message:"server error"})
    }
}

// login controller 
export const loginUser = async (req,res)=>{
    try {

        const {email,password}=req.body;

        if (!email){
            return res.status(400).json({
                message:"please, must provide an email"
            })
        }

        if (!password){
            return res.status(400).json({
                message:"please, must provide a password"
            })
        }


        //check if the user exsts 
        const user = await User.findOne({email}).select("+password")

    

        if (!user){
            return res.status(404).json({
                message:"user with this email does not exist"
            })
        }

        //check if the user active or not
        if(user.isActive === false){
            return res.status(403).json({
                message:"please verify your email first. A verifiation email has been sent to your email address!!"
            })
        }

        //  CHECK IF USER IS LOCKED
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remaining = Math.ceil(
                (user.lockUntil - Date.now()) / 60000
            );

            return res.status(429).json({
                message: `Too many attempts. Try again in ${remaining} minute(s)`
            });
        }
        

        //check if the user gave the correct password
        const isMatch = await bcrypt.compare(password,user.password)

        if (!isMatch) {
            user.loginAttempts += 1;

            // LOCK ACCOUNT
            if (user.loginAttempts >= 3) {
                user.lockUntil = Date.now() + 2 * 60 * 1000; // 5 minutes
                await user.save();

                return res.status(429).json({
                    message: "Too many attempts. Account locked for 2 minutes"
                });
            }

            await user.save();
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //if successs 
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        //generate jwt token
        const token = jwt.sign(
            {id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );

        user.password= undefined; //remove password from response 
        
        res.status(200).json({
            message:"Login successfull ",
            token:token,
            user:user
        })


    } catch (error) {
        console.log("login error at login controller: ->  ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}


//forget password 
export const forgotPassword = async (req,res)=>{
    try {

        const {email} = req.body;

        //check it the email is given
        if(!email){
            return res.status(400).json({
                message:"must provide an email"
            })
        }

        //check it the user exist
        const user = await User.findOne({email})

        if (!user){
            return res.status(404).json({
                message:"user with this email do not exists"
            })
        }


        //generate reset token 
        const resetToken = crypto.randomBytes(32).toString("hex")

        //attach the token to the user 

        user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

        //set a expiration date 
        user.resetPasswordExpires = Date.now() + 15*60*1000;

        await user.save();

        const resetLink = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}` //making a link with ecoded string


        sendPasswordResetLinkEmail(user.email,resetLink) // send link via email 

        res.json({
            message: "password reset link hasbeen sent to this email !!!"
        })
        
    } catch (error) {
        console.log("forgot password error", error);
        res.status(500).json({ message: "Server error" });
        
    }
}


//password resete
export const resetPassword = async (req,res)=>{
    try {
        
        const {token} = req.params;
        const {password} = req.body;

        //token validation
        if (!token){
            return res.json({
                message: "token is missing"
            })
        }   

        //check if the new passowrd is given
        if (!password){
            return res.json({
                message:"please provide a password"
            })
        }

        //creating token 
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

        //checking user 
        const user = await User.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpires:{ $gt: Date.now()}
        })

        if (!user){
            return res.status(404).json({
                message:"token expired or invalid"
            })
        }


        //hash new password
        user.password = await bcrypt.hash(password,12);


        //assing undefinded to resetPasswordtoken and resetPasswordExpires 
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires= undefined;

        await user.save();

        res.json({
            message:"password resete successfully"
        })

    } catch (error) {
        console.log("error at -> reset password controller")
        res.status(500).json({
            message:error.message
        })
    }
}


//generate admin invetaton
export const adminStaffInvite = async (req,res)=>{
    try {
        const{email,role}=req.body;

        //basic validation
        if (!email){
            return res.status(400).json({
                message:"please provide an email"
            })
        }

        if (!role){
            return res.status(400).json({
                message:"You must provide a role"
            })
        }

        

        /*if the user exist 
        make the user admin directly */

        const user = await User.findOne({email})

        if (user){

            if (user.role === role){
                return res.status(200).json({
                    message:`user already registered as ${role}`
                })
            }

            //update it's role to according to role submitted
            user.role=role
            await user.save()

            return res.status(200).json({
                message:`user already registered. role is updated to ${role} successfuly`
            })
        }

        //generate a token
        const token = crypto
        .randomBytes(32)
        .toString("hex")

        //create a AdminStaffToken reocorder instance

        const tokenRecorde = await AdminStaffTokenRecorde.create({
            email:email,
            role:role,
            invite_token:token,
            token_expires:Date.now() + 60*60*1000,
            sender:req.user.email,
            sender_role:req.user.role,
            isActive:true,
        })

        const link = `${process.env.BASE_URL}/api/auth/admin-staff-register/${token}`

        await emailQueue.add(
            "sendAdminStaffInviteEmail",
            {
                email,
                role,
                link
            },
            {
                attempts:3, //retry 3 times if fails
                backoff:5000 //wait 5 sec between retries
            }
        );

        res.json({
            message:"An invitaion email has been sent"
        })
        

    } catch (error) {
        console.log(`error at adminInvite controller : ${error.message}`)
    }
}

//admin or staff registers 
export const adminStaffRegisters = async (req,res)=>{
    try {
        const {username,email,phone,password,address} = req.body;
        const {reg_token}=req.params;

        //basic validation
        if (!reg_token){
            return res.status(400).json({
                message:"registration token missing"
            })
        }


        if (!username || !email || !password){
            return res.status(400).json({
                message: "required fields missing",
            });
        }

        //see if token exists 
        const token_recorde = await AdminStaffTokenRecorde.findOne({
            email:email,
            invite_token:reg_token,
        })

        //check if token is found
        if (!token_recorde){
            return res.status(400).json({
                message:"token not found"
            })
        }

        //check if the token is valid or not(checking expiry date)
        const current_time = Date.now() //geting the current token

        //check token expires
        if (token_recorde.token_expires < current_time){
            return res.json({
                message:"token has been expired. Please contact with admin"
            })
        }

        //prevent duplicate registration 
        const exists = await User.findOne({email});

        if (exists){
            return res.status(400).json({
                message:"email already registered"
            })
        }

        //hash password 

        const hashedPassword = await bcrypt.hash(password,10);


        //upload profile picture if provided 

        let porfilePicUrl = null;

        if (req.file){
            const uploadImage = ()=>{
                return new Promise((resolve,reject)=>{
                    const stream = cloudinary.v2.uploader.upload_stream(
                        {folder:"profile_pic"},
                        (err,result)=> (result ? resolve(result) : reject(err))
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            }

            const result = await uploadImage();
            porfilePicUrl = result.secure_url;
        }

        //generate email verification token 

        const token = crypto.randomBytes(32).toString("hex");

        //create inactive user 

        const user = await User.create({
            username,
            email,
            phone,
            password:hashedPassword,
            address,
            profile_pic: porfilePicUrl,
            emailVerifyToken:token,
            emailVerifyExpires: Date.now() + 15 *60*1000,
            role:token_recorde.role,
        })

        //create verify link  
        const verifyLink = `${process.env.BASE_URL}/api/auth/verify-email/${token}`

        //send verification email 

        await sendVerificationEmail(email,verifyLink);

        //make inactive the token 
        token_recorde.isActive=false
        await token_recorde.save()

        res.status(201).json({
        message: "Registration successful. Check your email to verify account."
        });
            
    } catch (error) {
        console.log("server error at register user funtion ",error.message);
        res.status(500).json({message:"server error"})
    }
}



//admin user deletion
export const adminUserDelation = async (req,res)=>{
    try {
        const {id}= req.params;
        //baisc validataion 
        if (!id){
            return res.status(400).json({
                message:"user id is missing"
            })
        }

        //find user 
        const user = await User.findById(id)

        //if user not found
        if (!user){
            return res.status(400).json({
                message:"user not found"
            })
        }


        await user.deleteOne()

        return res.json({
            message:"user deleted successfully"
        })

    } catch (error) {
        return res.json({
            message:error.message
        })
    }
}


//user delete for user 
export const userDelation = async(req,res)=>{
    try {
        const {id}= req.params;
        //baisc validataion 
        if (!id){
            return res.status(400).json({
                message:"user id is missing"
            })
        }

        //find user 
        const user = await User.findById(id)

        //check if the user is valid to do delation 

        if (req.user._id !== user._id){
            return res.json({
                message:"your are not authorized to do this operation"
            })
        }

        //if user not found
        if (!user){
            return res.status(400).json({
                message:"user not found"
            })
        }

        //delete user 
        await user.deleteOne()


        //clear cache 
        await deleteCacheByPattern("adminUsers:*")

        return res.json({
            message:"user deleted successfully"
        })

    } catch (error) {
        return res.json({
            message:error.message
        })
    }
}


//userupdation 
export const userUpdation = async (req,res)=>{
    try {
        const id= req.user._id;
        const {username,email,phone,address} = req.body;
        

        //find user 
        const user = await User.findById(id)

        

        //if user not found
        if (!user){
            return res.status(400).json({
                message:"user not found"
            })
        }

        //update user fields if  provided

        if(username) user.username=username
        if(email) user.email=email
        if(phone) user.phone=phone
        if(address) user.address=address

        

        let profilePicUrl = null

        if (req.file){
            const uploadImage = ()=>{
                return new Promise((resolve,reject)=>{
                    const stream = cloudinary.v2.uploader.upload_stream(
                        {folder:"profile_pic"},
                        (err,result)=>(result ? resolve(result) : reject(err))
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                })
            }

            const result = await uploadImage();
            profilePicUrl = result.secure_url;
            user.profile_pic = profilePicUrl
        }

        
        //save the user 
        await user.save()


        //clear cache 
        await deleteCacheByPattern("adminUsers:*")


        return res.json({
            message:"updated successfully"
        })

    } catch (error) {
        return res.json({
            message:error.message
        })
    }
}


//admin user list 
export const userSearchFilter = async (req,res)=>{
    try {
        //query params 
        const {
            username,
            email,
            role,
            isActive,
            page=1,
            limit = 10,
        } = req.query;


        //unique cache key
        const cacheKey = `adminUsers:${JSON.stringify(req.query)}`;

        //check cache 
        const cachedData = await getCache(cacheKey)

        if (cachedData){
            console.log("from redis cache")
            return res.json(cachedData);
        }

        //buld  dynamic filter object 
        let filter = {}

        if (username) {
            filter.username = {$regex: username, $options: "i"}
        }
        
        if (role){
            filter.role = role;
        }

        if (isActive !== undefined){
            filter.isActive = isActive === "true"
        }


        //pagination calculation 

        const skip = (page -1) * limit;

        //find users 
        const users = await User.find(filter)
        .skip(skip)
        .limit(Number(limit))

        //totla count 
        const totalUsers = await User.countDocuments(filter);

        //constructing response 
        const response = {
            total:totalUsers,
            page:Number(page),
            limit:Number(limit),
            users:users,
        }

        await setCache(cacheKey,response,300)

        return res.json(response)
    } catch (error) {
        return res.json({
            message:error.message
        })
    }
}




