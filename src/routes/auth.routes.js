import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
    registerUser,
    verifyEmail,
    loginUser,
    forgotPassword,
    resetPassword,
    adminStaffInvite,
    adminStaffRegisters,
    adminUserDelation,
    userDelation,
    userUpdation,
    userSearchFilter,
} from "../controllers/auth.controller.js"


import {protect,adminAccess} from "../middlewares/auth.mddleware.js"

const router = express.Router();

//user register  
router.post("/register",upload.single("profile_pic"),registerUser);

//email verification 
router.get("/verify-email/:token",verifyEmail);

//user login 
router.post("/login",loginUser)

//forget password
router.post("/forget-password",forgotPassword)

//reset password 
router.post("/reset-password/:token",resetPassword)

//adminStaff invite 
router.post("/admin-staff-invite",adminAccess,adminStaffInvite)

//admin or staff registration 
router.post("/admin-staff-register/:reg_token",upload.single("profile_pic"),adminStaffRegisters)

//admin user deletion 
router.delete("/admin-user-delete/:id",adminAccess,adminUserDelation)

//user deletation 
router.delete("/user-delete/:id",protect,userDelation)

//user updation 
router.put("/user-update",protect,upload.single("profile_pic"),userUpdation)

//admin userlist 
router.get("/user-list",adminAccess,userSearchFilter)






// ********************* TEST ***************************


//user test 
router.get("/user-info",protect,(req,res)=>{
    res.json({
        message: "protected route accessed",
        user:req.user,
        role:req.user.role
    })
})

//admin access test 
router.get("/admin",adminAccess,(req,res)=>{
    res.json({
        message:"wellcome admin",
        user:req.user
    })
})


export default router;