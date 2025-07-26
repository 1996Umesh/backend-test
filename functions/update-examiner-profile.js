require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Examiner = require('../models/examiner');
const authorize = require('./authorize');
const bcrypt = require('bcryptjs');

const headers = {
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        await connectDB();

        const auth = authorize(event, ['examiner']);
        if (!auth.success) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        };

        const { id, examiner_email, examiner_password } = JSON.parse(event.body);

        if (!id || !examiner_email || !examiner_password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        const hashedPassword = await bcrypt.hash(examiner_password, 10);

        const updated = await Examiner.findByIdAndUpdate(
            id,
            {
                examiner_email,
                examiner_password: hashedPassword,
            },
            { new: true }
        );

        if (!updated) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Examiner not found' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Profile updated successfully' }),
        };
    } catch (err) {
        console.error('Update error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error' }),
        };
    }
};
