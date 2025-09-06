require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

const authorize = require('./authorize');

const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    // 'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
};
// const headers = {
//     'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
//     'Access-Control-Allow-Headers': 'Content-Type',
//     'Access-Control-Allow-Methods': 'GET, OPTIONS',
//     'Content-Type': 'application/json',
// };
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    const auth = authorize(event, ['student']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers,
            body: auth.body,
        };
    }

    try {
        await connectDB();
        
        const exams = await Exam.find()
            .sort({ _id: -1 }) // newest first
            .limit(5)          // only 5 records
            .lean();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(exams),
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