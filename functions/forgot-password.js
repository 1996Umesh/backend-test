require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');


let isConnected = false;
async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { resetEmail } = JSON.parse(event.body);
        if (!resetEmail) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Email or User ID is required' }),
            };
        }

        // Connect DB
        await connectDB();

        let user = await Superadmin.findOne({ superadmin_email: resetEmail });

        if (!user) {
            user = await CountryDirector.findOne({ countrydirector_email: resetEmail });
        }
        if (!user) {
            user = await Examiner.findOne({ examiner_email: resetEmail });
        }
        if (!user) {
            user = await Student.findOne({ student_email: resetEmail });
        }

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' }),
            };
        }

        // Generate reset token (simple example, you can use JWT or crypto)
        const resetToken = Math.random().toString(36).substr(2, 20);
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            }
        });

        const userEmail = user.superadmin_email ||
            user.countrydirector_email ||
            user.examiner_email ||
            user.student_email;

        await transporter.sendMail({
            from: `"Support" <umesh123hirantha@gmail.com>`,
            to: userEmail,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Reset link sent to your email' }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
