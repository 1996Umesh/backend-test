const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');
require('dotenv').config();

// ---------- CORS ----------
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // in production, replace with frontend origin
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const respond = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
});

// ---------- Mongo cache ----------
let cached = global._mongooseCached;
async function connectDB() {
    if (cached) return cached;
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
    mongoose.set('strictQuery', true);
    cached = await mongoose.connect(process.env.MONGO_URI);
    global._mongooseCached = cached;
    return cached;
}

// ---------- Models to check ----------
const USER_MODELS = [
    { model: Superadmin, emailField: 'superadmin_email', passwordField: 'superadmin_password' },
    { model: CountryDirector, emailField: 'countrydirector_email', passwordField: 'countrydirector_password' },
    { model: Examiner, emailField: 'examiner_email', passwordField: 'examiner_password' },
    { model: Student, emailField: 'student_email', passwordField: 'student_password' },
];

async function updateUserPassword(email, hashedPassword) {
    for (const { model, emailField, passwordField } of USER_MODELS) {
        const q = {}; q[emailField] = email;
        const user = await model.findOne(q);
        if (user) {
            user[passwordField] = hashedPassword;
            await user.save();
            return true;
        }
    }
    return false;
}

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return respond(200, { ok: true });
    }
    if (event.httpMethod !== 'POST') {
        return respond(405, { error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { token, email, password } = JSON.parse(event.body || '{}');

        // Validate input
        if (!token || !email || !password) {
            return respond(400, { error: 'Token, email, and new password are required.' });
        }

        // NOTE: This version does NOT validate token in DB — for security in production,
        // you should store and verify token expiry
        if (token.length < 10) {
            return respond(400, { error: 'Invalid token.' });
        }

        // Hash new password
        const hashed = await bcrypt.hash(password, 10);

        const updated = await updateUserPassword(email, hashed);
        if (!updated) {
            return respond(404, { error: 'User not found.' });
        }

        return respond(200, { message: 'Password reset successful. You can now log in.' });

    } catch (err) {
        console.error(err);
        return respond(500, { error: 'Internal Server Error' });
    }
};
