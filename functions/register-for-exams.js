require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const StudentExam = require('../models/studentexam');
const authorize = require('./authorize');

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

    // ✅ Authorize request (only allow student)
    const auth = authorize(event, ['student']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: auth.body,
        };
    }

    try {
        await connectDB();

        const { student_id, exam_id } = JSON.parse(event.body);

        const newExamReg = new StudentExam({
            student_id,
            exam_id,
        });

        const savedExamReg = await newExamReg.save();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully Registered for exam!',
                _id: savedExamReg._id,
            }),
        };

    } catch (err) {
        console.error('❌ Error details:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }

};
