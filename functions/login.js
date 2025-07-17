require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');

const Superadmin = require('../models/superadmin');
const CountryDirector = require('../models/countrydirector');
const Examiner = require('../models/examiner');
const Student = require('../models/student');

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

    const { email, password } = JSON.parse(event.body);

    let user = null;
    let role = null;
    let passwordMatch = false;

    // Check Superadmin
    const superadmin = await Superadmin.findOne({ superadmin_email: email });
    if (superadmin && await bcrypt.compare(password, superadmin.superadmin_password)) {
      user = superadmin;
      role = 'superadmin';
    }

    // Check Country Director
    if (!user) {
      const countrydirector = await CountryDirector.findOne({ countrydirector_email: email });
      if (countrydirector && await bcrypt.compare(password, countrydirector.countrydirector_password)) {
        user = countrydirector;
        role = 'countrydirector';
      }
    }

    // Check Examiner
    if (!user) {
      const examiner = await Examiner.findOne({ examiner_email: email });
      if (examiner && await bcrypt.compare(password, examiner.examiner_password)) {
        user = examiner;
        role = 'examiner';
      }
    }

    // Check Student
    if (!user) {
      const student = await Student.findOne({ student_email: email });
      if (student && await bcrypt.compare(password, student.student_password)) {
        user = student;
        role = 'student';
      }
    }

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    // 🔐 Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        message: 'Login successful',
        token,
        role,
        userId: user._id,
        email: email,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({ error: 'Server error: ' + error.message }),
    };
  }
};
