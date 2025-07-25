require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const Examiner = require('../models/examiner');
const authorize = require('./authorize'); // If in separate file, otherwise copy function above

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // ✅ Authorize request (only allow countrydirector)
    const auth = authorize(event, ['countrydirector']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: auth.body,
        };
    }

    try {
        await connectDB();

        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Missing request body' }),
            };
        }

        const { examiner_name, subject_id, examiner_email, examiner_password, countrydirector_id } = JSON.parse(event.body);

        // Validate required fields
        if (
            !examiner_name ||
            !subject_id ||
            !examiner_email ||
            !examiner_password ||
            !countrydirector_id
        ) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        // Check if user already exists
        const existing = await Examiner.findOne({ examiner_email });
        if (existing) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Email already exists.' }),
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(examiner_password, 10);

        // Create new Examiner
        const newExaminer = new Examiner({
            examiner_name,
            subject_id,
            examiner_email,
            examiner_password: hashedPassword,
        });

        const savedExaminer = await newExaminer.save();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({
                message: 'Examiner created successfully!',
                _id: savedExaminer._id,
            }),
        };
    } catch (err) {
        console.error('❌ Server Error:', err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
