require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const Student = require('../models/student');

exports.handler = async (event) => {
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

    const body = JSON.parse(event.body);
    const { student_name, student_email, student_password } = body;

    // validate only required fields
    if (!student_name || !student_email || !student_password) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Email, password and name are required.' }),
      };
    }

    // check existing
    const existing = await Student.findOne({ student_email });
    if (existing) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Email already exists.' }),
      };
    }

    // hash password
    const hashedPassword = await bcrypt.hash(student_password, 10);

    // create student with optional fields defaulting to null
    const newStudent = new Student({
      student_name: student_name,
      student_email: student_email,
      student_password: hashedPassword,
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
