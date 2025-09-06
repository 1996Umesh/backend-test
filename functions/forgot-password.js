const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');

require('dotenv').config();

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

// Helper: add CORS headers
function withCORS(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": process.env.FRONTEND_URL || '*',
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.FRONTEND_URL || '*',
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return withCORS(405, { error: "Method not allowed" });
  }

  try {
    const { resetEmail } = JSON.parse(event.body);
    if (!resetEmail) {
      return withCORS(400, { error: "Email or User ID is required" });
    }

    await connectDB();

    let user = await Superadmin.findOne({ superadmin_email: resetEmail })
      || await CountryDirector.findOne({ countrydirector_email: resetEmail })
      || await Examiner.findOne({ examiner_email: resetEmail })
      || await Student.findOne({ student_email: resetEmail });

    if (!user) {
      return withCORS(404, { error: "User not found" });
    }

    // TODO: Save this token in DB with expiry
    const resetToken = Math.random().toString(36).substr(2, 20);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const userEmail =
      user.superadmin_email ||
      user.countrydirector_email ||
      user.examiner_email ||
      user.student_email;

    await transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    return withCORS(200, { message: "Reset link sent to your email" });
  } catch (err) {
    console.error(err);
    return withCORS(500, { error: "Internal Server Error" });
  }
};
