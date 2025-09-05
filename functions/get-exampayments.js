require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('./connect');
const ExamPayment = require('../models/exampayment');
const Exam = require('../models/exam'); // ✅ required for populate to work
const authorize = require('./authorize');

const headers = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  const auth = authorize(event, ['student']);
  if (!auth.success) {
    return {
      statusCode: auth.statusCode,
      headers,
      body: auth.body,
    };
  }

  try {
    await connectDB();

    const studentId = event.queryStringParameters.student_id;
    if (!studentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing student_id' }),
      };
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid student_id format' }),
      };
    }

    const exampayments = await ExamPayment.find({ student_id: studentId })
      .populate('exam_id')
      .sort({ _id: -1 })
      .lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(exampayments),
    };
  } catch (error) {
    console.error("❌ Server Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', detail: error.message }),
    };
  }
};
