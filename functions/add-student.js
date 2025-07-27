require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const Student = require('../models/student');
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
      student_email,
      student_password,
      student_name,
      student_address,
      student_country,
      student_phone,
      date_of_birth,
      gender,
      guardian_name,
      guardian_address,
      guardian_phone,
    } = JSON.parse(event.body);

    // Validate required fields
    if (
      !student_email ||
      !student_password ||
      !student_name ||
      !student_address ||
      !student_country ||
      !student_phone ||
      !date_of_birth ||
      !gender ||
      !guardian_name ||
      !guardian_address ||
      !guardian_phone
    ) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'All fields are required.' }),
      };
    }

    // Check if user already exists
    const existing = await Student.findOne({ student_email });
    if (existing) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Email already exists.' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(student_password, 10);

    // Create new Student
    const newStudent = new Student({
      student_email,
      student_password: hashedPassword,
      student_name,
      student_address,
      student_country,
      student_phone,
      date_of_birth,
      gender,
      guardian_name,
      guardian_address,
      guardian_phone,
    });

    const savedStudent = await newStudent.save();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({
        message: 'Student registered successfully!',
        _id: savedStudent._id,
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
