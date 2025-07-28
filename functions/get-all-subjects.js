require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Subject = require('../models/subject');
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

    try {
        await connectDB();

        // const countrydirectorId = event.queryStringParameters.countrydirector_id;
        const subjects = await Subject.find().lean();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(subjects),
        };
    } catch (error) {
        console.error("❌ Error fetching subjects:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};