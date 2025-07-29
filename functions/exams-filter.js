require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const { country, subject, examDate, startTime } = event.queryStringParameters;

        // Connect to DB
        await connectDB();

        const filter = {};
        if (country) filter.country = country;
        if (subject) filter.subject_id = subject;
        if (startTime) filter.exam_start_time = startTime;

        // Handle date properly
        if (examDate) {
            const start = new Date(examDate);
            const end = new Date(examDate);
            end.setUTCHours(23, 59, 59, 999);
            filter.exam_date = { $gte: start, $lte: end };
        }

        const exams = await Exam.find(filter).lean();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(exams),
        };
    } catch (error) {
        console.error('❌ Filter fetch error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error', detail: error.message }),
        };
    }
};
