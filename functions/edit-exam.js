require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
// const bcrypt = require('bcryptjs');
const Exam = require('../models/exam');

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: '',
        };
    }

    if (event.httpMethod !== 'PUT') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
            },
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        await connectDB();

        const { id, exam_name, exam_fee, exam_date, exam_start_time, exam_end_time } = JSON.parse(event.body);

        if (!id) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                },
                body: JSON.stringify({ error: 'ID is required' }),
            };
        }

        const start = new Date(`${exam_date}T${exam_start_time}`);
        const end = new Date(`${exam_date}T${exam_end_time}`);
        const duration = (end - start) / 60000;

        const updateData = {
            exam_name: exam_name,
            exam_fee: exam_fee,
            exam_date: exam_date,
            exam_start_time: exam_start_time,
            exam_end_time: exam_end_time,
            exam_time_duration: duration,
        };

        const updated = await Exam.findByIdAndUpdate(id, updateData, { new: true });

        if (!updated) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                },
                body: JSON.stringify({ error: 'Exam not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Exam updated successfully', subject: updated }),
        };

    } catch (err) {
        console.error('❌ Error updating Exam:', err);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
            },
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
