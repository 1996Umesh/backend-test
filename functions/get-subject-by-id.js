require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Subject = require('../models/subject');

exports.handler = async (event) => {
    // Handle CORS preflight
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
            headers: { 'Allow': 'GET' },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        await connectDB();

        const id = event.queryStringParameters && event.queryStringParameters.id;

        if (!id) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Missing ID parameter' }),
            };
        }

        const subject = await Subject.findById(id);

        if (!subject) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'subject not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify(subject),
        };
    } catch (err) {
        console.error("❌ Server Error:", err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
