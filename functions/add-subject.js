require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const Subject = require('../models/subject');
const authorize = require('./authorize'); // If in separate file, otherwise copy function above
// const { Console } = require('console');

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



    // ✅ Authorize request
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

        const { subject_code, subject_title, countrydirector_id } = JSON.parse(event.body);

        // Validate required fields 
        if (!subject_code || !subject_title) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        // Create new Subject
        const newSubject = new Subject({ subject_code, subject_title, countrydirector_id });
        const savedSubject = await newSubject.save();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({
                message: 'Subject created successfully!',
                _id: savedSubject._id,
            }),
        };
    } catch (err) {
        console.error('❌ Server Error:', err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({
                error: 'Internal Server Error',
                details: err.message  // 👈 expose actual error in response
            }),
        };
    }
};