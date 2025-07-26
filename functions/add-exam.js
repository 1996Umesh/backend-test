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

        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Missing request body' }),
            };
        }

        const { exam_name, exam_fee, exam_date, exam_start_time, exam_end_time, examiner_id } = JSON.parse(event.body);

        // Validate required fields
        if (!exam_name || !exam_fee || !exam_date || !exam_start_time || !exam_end_time || !examiner_id) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'All fields are required.' }),
            };
        }

        const examiner = await Examiner.findById(examiner_id);
        const countrydirectorId = examiner.countrydirector_id;
        const subjectId = examiner.subject_id;
        const countrydirector = await Countrydirector.findById(countrydirectorId);
        const country = countrydirector.country;
        const duration = exam_end_time - exam_start_time;

        // Create new Exam
        const newExam = new Exam({
            exam_name,
            exam_fee,
            exam_date,
            exam_start_time,
            exam_end_time,
            exam_time_duration: duration,
            subject_id: subjectId,
            examiner_id: examiner_id,
            country: country,
        });

        const savedExam = await newExam.save();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({
                message: 'Exam created successfully!',
                _id: savedExam._id,
            }),
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
