require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');

// const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
// const Examiner = require('../models/examiner');
// const Student = require('../models/student');

exports.handler = async (event) => {
    // CORS preflight
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

    try {
        await connectDB();

        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
                body: JSON.stringify({ error: 'Missing request body' }),
            };
        }

        const { country, countrydirector_name, phone, countrydirector_email, countrydirector_password } = JSON.parse(event.body);

        const hashedPassword = await bcrypt.hash(countrydirector_password, 10);

        const newCD = new CountryDirector({
            country: country,
            countrydirector_name: countrydirector_name,
            phone: phone,
            countrydirector_email: countrydirector_email,
            countrydirector_password: hashedPassword,
        });

        await newCD.save();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({ message: 'Country Director created successfully!' }),
        };

        // return {
        //     statusCode: 200,
        //     headers: {
        //         'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        //         'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        //         'Access-Control-Allow-Credentials': 'true',
        //     },
        //     body: JSON.stringify({
        //         message: 'Login successful',
        //         token,
        //         role,
        //         userId: user._id,
        //         email: email,
        //     }),
        // };
    } catch (error) {
        // console.error('Login error:', error);
        // return {
        //     statusCode: 500,
        //     headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        //     body: JSON.stringify({ error: 'Server error: ' + error.message }),
        // };

        console.error("❌ Server Error:", err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    }
};
