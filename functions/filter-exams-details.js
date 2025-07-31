require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    const examId = event.queryStringParameters && event.queryStringParameters.exam_id;

    if (!examId) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({ error: 'Missing ID parameter' }),
        };
    }

    try {
        await connectDB();

        const exam_details = await Exam.findById(examId).lean();

        if (!exam_details) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Exam not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(exam_details),
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
