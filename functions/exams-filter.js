require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

const headers = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();

    const { country, subject, examDate, startTime } = event.queryStringParameters;

    const filter = {};

    if (country) filter.exam_country = country;
    if (subject) filter.subject_id = subject;
    if (examDate) filter.exam_date = examDate;
    if (startTime) filter.exam_start_time = startTime;

    const exams = await Exam.find(filter).sort({ exam_date: 1 }).lean();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(exams),
    };
  } catch (error) {
    console.error('❌ Filter fetch error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error', detail: error.message }),
    };
  }
};
