require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const CountryDirector = require('../models/countrydirector');
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

  // ✅ Authorize request (only allow superadmin)
  const auth = authorize(event, ['superadmin']);
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

    const {
      country,
      countrydirector_name,
      countrydirector_email,
      phone,
      countrydirector_password,
    } = JSON.parse(event.body);

    // Validate required fields
    if (
      !country ||
      !countrydirector_name ||
      !countrydirector_email ||
      !phone ||
      !countrydirector_password
    ) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'All fields are required.' }),
      };
    }

    // Check if user already exists
    const existing = await CountryDirector.findOne({ countrydirector_email });
    if (existing) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Email already exists.' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(countrydirector_password, 10);

    // Create new CountryDirector
    const newDirector = new CountryDirector({
      country,
      countrydirector_name,
      countrydirector_email,
      phone, // already full international number (e.g., +94771234567)
      countrydirector_password: hashedPassword,
    });

    const savedDirector = await newDirector.save();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({
        message: 'Country Director created successfully!',
        _id: savedDirector._id,
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
