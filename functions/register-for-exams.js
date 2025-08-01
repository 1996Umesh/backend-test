require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const StudentExam = require('../models/studentexam');
const authorize = require('./authorize');

const commonHeaders = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
};

exports.handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                commonHeaders,
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: commonHeaders,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Authorize request
    const auth = authorize(event, ['student']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers: commonHeaders,
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

        await newExamReg.save();

        return {
            statusCode: 200,
            headers: {
                commonHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Successfully Registered for exam!',
            }),
        };
    } catch (err) {
        console.error('❌ Error details:', err);
        return {
            statusCode: 500,
            headers: {
                commonHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }
};
