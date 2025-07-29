require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

const headers = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();
    const { country, subject, examDate, startTime } = JSON.parse(event.body);

    const filter = {};

    if (country) {
      filter.exam_country = { $regex: new RegExp(country, 'i') };
    }
    if (subject) {
      filter.subject_id = subject;
    }
    if (examDate) {
      filter.exam_date = examDate;
    }
    if (startTime) {
      filter.exam_start_time = startTime;
    }

    const exams = await Exam.find(filter).sort({ exam_date: 1 }).lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(exams),
    };
  } catch (err) {
    console.error('❌ Error filtering exams:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
