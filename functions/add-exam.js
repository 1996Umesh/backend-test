require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const Exam = require('../models/exam');
const Examiner = require('../models/examiner');
const Countrydirector = require('../models/countrydirector');
const authorize = require('./authorize'); // If in separate file, otherwise copy function above

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

    // ✅ Authorize request (only allow examiner)
    const auth = authorize(event, ['examiner']);
    if (!auth.success) {
        return {
            statusCode: auth.statusCode,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: auth.body,
        };
    }

    try {
        await connectDB();

        const { exam_name, exam_fee, exam_date, exam_start_time, exam_end_time, examiner_id } = JSON.parse(event.body);

        if (!exam_name || !exam_fee || !exam_date || !exam_start_time || !exam_end_time || !examiner_id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        const examiner = await Examiner.findById(examiner_id);
        if (!examiner) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Examiner not found.' }),
            };
        }

        const countrydirector = await Countrydirector.findById(examiner.countrydirector_id);
        if (!countrydirector) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Countrydirector not found.' }),
            };
        }

        const start = new Date(`${exam_date}T${exam_start_time}`);
        const end = new Date(`${exam_date}T${exam_end_time}`);
        const duration = (end - start) / 60000;

        const newExam = new Exam({
            exam_name,
            exam_fee,
            exam_date,
            exam_start_time,
            exam_end_time,
            exam_time_duration: duration,
            subject_id: examiner.subject_id,
            examiner_id,
            country: countrydirector.country,
        });

        const savedExam = await newExam.save();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Exam created successfully!',
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
