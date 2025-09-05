require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Student = require('../models/student');
const authorize = require('./authorize');

const headers = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    await connectDB();

    // 🛡️ Check role
    const auth = authorize(event, ['student']);
    if (!auth.success) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const userId = event.queryStringParameters?.id;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const student = await Student.findById(userId).select('-student_password');

    if (!student) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Student not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        id: student._id,
        student_name: student.student_name,
        student_email: student.student_email,
        // student_password: student.student_password,
        student_name_in_certificate: student.student_name_in_certificate,
        student_id_type: student.student_id_type,
        student_id: student.student_id,
        gender: student.gender,
        student_address: student.student_address,
        student_phone: student.student_phone_no,
        guardian_name: student.guardian_name,
        guardian_phone: student.guardian_phone_no,
      }),
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
