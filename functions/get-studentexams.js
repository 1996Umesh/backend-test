require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const StudentExam = require('../models/studentexam');

const authorize = require('./authorize');

const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
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

        const studentId = event.queryStringParameters.student_id;
        const studentexams = await StudentExam.find({ student_id: studentId })
            .sort({ _id: -1 })
            .lean();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(studentexams),
        };
    } catch (error) {
        console.error("❌ Error fetching exams:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};