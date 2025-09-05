require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const ExamPayment = require('../models/exampayment');
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
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Authorize request
    const auth = authorize(event, ['student']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: auth.body,
        };
    }

    try {
        await connectDB();

        const { paid_amount, student_id, exam_id } = JSON.parse(event.body);

        const newExamReg = new ExamPayment({
            paid_date: new Date(),
            paid_amount,
            payment_status: "1",
            student_id,
            exam_id,
            
        });

        await newExamReg.save();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
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
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ error: 'Internal Server Error', details: err.message }),
        };
    }
};
