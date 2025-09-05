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

    let userId = null;
    let role = null;
    let user = null;

    // Check Superadmin
    const superadmin = await Superadmin.findOne({ superadmin_email: email });
    if (superadmin && await bcrypt.compare(password, superadmin.superadmin_password)) {
      user = superadmin;
      userId = superadmin._id;
      role = 'superadmin';
    }

    // Check Country Director
    if (!user) {
      const countrydirector = await CountryDirector.findOne({
        $or: [
          { countrydirector_email: email },
          { countrydirector_id: email }
        ]
      });
      if (countrydirector && await bcrypt.compare(password, countrydirector.countrydirector_password)) {
        user = countrydirector;
        userId = countrydirector._id;
        role = 'countrydirector';
      }
    }

    // Check Examiner
    if (!user) {
      const examiner = await Examiner.findOne({
        $or: [
          { examiner_email: email },
          { examiner_id: email }
        ]
      });
      if (examiner && await bcrypt.compare(password, examiner.examiner_password)) {
        user = examiner;
        userId = examiner._id;
        role = 'examiner';
      }
    }

    // Check Student
    // if (!user) {
    //   const student = await Student.findOne({ student_email: email });
    //   if (student && await bcrypt.compare(password, student.student_password)) {
    //     user = student;
    //     userId = student._id;
    //     role = 'student';
    //   }
    // }

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    // 🔐 Generate JWT token
    const token = jwt.sign(
      { userId, role },
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
        userId
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
