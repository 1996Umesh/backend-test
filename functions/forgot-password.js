require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');

// ----------------- DB CONNECTION -----------------
let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    if (!process.env.MONGO_URI) {
        throw new Error("❌ MONGO_URI is missing in .env file");
    }
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
}

// ----------------- COMMON CORS HEADERS -----------------
const headers = {
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true"
};

// ----------------- MAIN HANDLER -----------------
exports.handler = async (event) => {
    // Handle CORS preflight (OPTIONS request)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: "OK"
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const { resetEmail } = JSON.parse(event.body);

        if (!resetEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Email or User ID is required" })
            };
        }

        // Connect DB
        await connectDB();

        // Find user in any of the collections
        let user = await Superadmin.findOne({ superadmin_email: resetEmail })
            || await CountryDirector.findOne({ countrydirector_email: resetEmail })
            || await Examiner.findOne({ examiner_email: resetEmail })
            || await Student.findOne({ student_email: resetEmail });

        if (!user) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: "User not found" })
            };
        }

        const userEmail = user.superadmin_email ||
            user.countrydirector_email ||
            user.examiner_email ||
            user.student_email;

        // Encode email to make it safe for URLs
        const encodedEmail = encodeURIComponent(user.superadmin_email ||
            user.countrydirector_email ||
            user.examiner_email ||
            user.student_email);

        // Generate reset token
        const resetToken = Math.random().toString(36).substr(2, 20);

        // Reset link with token + email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodedEmail}`;

        // Configure Gmail transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });



        await transporter.sendMail({
            from: `"Support" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p>
                   <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Reset link sent to your email" })
        };

    } catch (err) {
        console.error("❌ Forgot-password error:", err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
