require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Examiner = require('../models/examiner');
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

        const countrydirectorId = event.queryStringParameters.countrydirector_id;
        const examiners = await Examiner.find({ countrydirector_id: countrydirectorId })
            .sort({ _id: -1 })
            .populate('subject_id') // this pulls in full subject details
            .lean();


        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(examiners),
        };
    } catch (error) {
        console.error("❌ Error fetching examiners:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};