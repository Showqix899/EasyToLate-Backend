import nodemailer from "nodemailer"
import dotenv from "dotenv"


dotenv.config()
//create reusabel email transporter 

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    auth:{
        user:process.env.SMTP_EMAIL,
        pass:process.env.SMTP_PASSWORD
    }
});



// send verification email
export const sendVerificationEmail = async (email, link) => {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your account",
    html: `
      <h2>Account Verification</h2>
      <p>Click the link below to activate your account:</p>
      <a href="${link}">${link}</a>
    `
  });
};

//send password reset link email
export const sendPasswordResetLinkEmail = async (email,link) => {
  try {
    await transporter.sendMail({

      from: `"Auth System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <h2>password resete</h2>
        <p>Click the link below to reset password</p>
        <a href="${link}">${link}</a>
      `
    })
  } catch (error) {
    return res.status(500).json({
      message:error.message
    })
  }
}


//send admin or staff invite link via email 
export const sendAdminStaffInviteEmail = async (email,role,link)=>{
   try {
    await transporter.sendMail({

      from: `"Auth System" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `${role} invitation`,
      html: `
        <h2>Invitaion linke</h2>
        <p>Please click this linke to register as ${role}</p>
        <a href="${link}">${link}</a>
      `
    })
  } catch (error) {
    return res.status(500).json({
      message:error.message
    })
  }
}
