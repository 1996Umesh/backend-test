require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const CountryDirector = require('../models/countrydirector');
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

        const auth = authorize(event, ['countrydirector']);
        if (!auth.success) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        };

        const { id, countrydirector_email, countrydirector_password } = JSON.parse(event.body);

        if (!id || !countrydirector_email || !countrydirector_password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        const hashedPassword = await bcrypt.hash(countrydirector_password, 10);

        const updated = await CountryDirector.findByIdAndUpdate(
            id,
            {
                countrydirector_email,
                countrydirector_password: hashedPassword,
            },
            { new: true }
        );

        if (!updated) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Superadmin not found' }),
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
