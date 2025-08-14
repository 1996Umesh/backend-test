const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');
require('dotenv').config();

// ---------- CORS ----------
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // for production, set your exact frontend origin
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respond = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
});

// ---------- Mongo cache for serverless ----------
let cached = global._mongooseCached;
async function connectDB() {
    if (cached) return cached;
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
    mongoose.set('strictQuery', true);
    cached = await mongoose.connect(process.env.MONGODB_URI, {
        dbName: process.env.MONGODB_DB || undefined,
    });
    global._mongooseCached = cached;
    return cached;
}

// ---------- Mail transport ----------
function buildTransport() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // Gmail App Password
        },
    });
}

// ---------- Find user by email across models ----------
const USER_MODELS = [
    { model: Superadmin, emailField: 'superadmin_email' },
    { model: CountryDirector, emailField: 'countrydirector_email' },
    { model: Examiner, emailField: 'examiner_email' },
    { model: Student, emailField: 'student_email' },
];

async function findUserEmail(resetEmail) {
    for (const { model, emailField } of USER_MODELS) {
        const q = {}; q[emailField] = resetEmail;
        const user = await model.findOne(q).lean();
        if (user) return user[emailField];
    }
    return null;
}

exports.handler = async (event) => {
    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return respond(200, { ok: true });
    }
    if (event.httpMethod !== 'POST') {
        return respond(405, { error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { resetEmail } = JSON.parse(event.body || '{}');
        if (!resetEmail) {
            return respond(400, { error: 'Email is required' });
        }

        // Generate a simple, ephemeral token (no DB storage in this minimal version)
        const resetToken = Math.random().toString(36).slice(2, 22);
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(resetEmail)}`;

        // Try to locate a user; if not found, we still return a generic success
        const userEmail = await findUserEmail(resetEmail);

        const genericMessage = { message: 'If the account exists, a reset email has been sent.' };

        // Only send email if user exists
        if (userEmail) {
            const transporter = buildTransport();
            const fromEmail = process.env.GMAIL_USER;

            await transporter.sendMail({
                from: `"Support" <${fromEmail}>`,
                to: userEmail,
                subject: 'Password Reset Request',
                html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;">
              <p>You requested a password reset.</p>
              <p>Click the link below to reset your password:</p>
              <p><a href="${resetLink}">${resetLink}</a></p>
              <p>If you didn't request this, you can ignore this email.</p>
            </div>
          `,
            });
        }

        // Always generic to avoid user enumeration
        return respond(200, genericMessage);

    } catch (err) {
        console.error(err);
        return respond(500, { error: 'Internal Server Error' });
    }
};