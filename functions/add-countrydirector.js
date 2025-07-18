// netlify/functions/add-countrydirector.js

const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const CountryDirector = require('./models/countrydirector');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        // Parse request body
        const data = JSON.parse(event.body);

        // Validate required fields
        const requiredFields = ['country', 'countrydirector_name', 'phone', 'countrydirector_email', 'countrydirector_password'];
        for (const field of requiredFields) {
            if (!data[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: `Missing field: ${field}` }),
                };
            }
        }

        // Connect to MongoDB
        await connectDB();

        // Check for duplicate email
        const existing = await CountryDirector.findOne({ countrydirector_email: data.countrydirector_email });
        if (existing) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'Email already exists' }),
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.countrydirector_password, 10);

        // Create new director
        const newDirector = new CountryDirector({
            country: data.country,
            countrydirector_name: data.countrydirector_name,
            phone: data.phone,
            countrydirector_email: data.countrydirector_email,
            countrydirector_password: hashedPassword
        });

        await newDirector.save();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Country Director created successfully!' }),
        };
    } catch (err) {
        console.error('❌ Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: err.message }),
        };
    }
};
