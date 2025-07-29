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

    // if (country) filter.exam_country = country;
    // if (subject) filter.subject_id = subject;
    // if (examDate) filter.exam_date = examDate;
    // if (startTime) filter.exam_start_time = startTime;

    // const exams = await Exam.find(filter).sort({ exam_date: 1 }).lean();

    if (country && subject && examDate && startTime) {
        const exams = await Exam.find({ country: country, subject_id:subject, exam_date: examDate, exam_start_time:startTime}).lean();
    } else if (startTime) {
        const exams = await Exam.find({ exam_start_time:startTime}).lean();
    } else if (examDate) {
        const exams = await Exam.find({ exam_date: examDate}).lean();
    } else if (examDate && startTime) {
        const exams = await Exam.find({ exam_date: examDate, exam_start_time:startTime}).lean();
    } else if (subject) {
        const exams = await Exam.find({ subject_id:subject}).lean();
    } else if (subject && startTime) {
        const exams = await Exam.find({ subject_id:subject, exam_start_time:startTime}).lean();
    } else if (subject && examDate) {
        const exams = await Exam.find({ subject_id:subject, exam_date: examDate}).lean();
    } else if (subject && examDate && startTime) {
        const exams = await Exam.find({ subject_id:subject, exam_date: examDate, exam_start_time:startTime}).lean();
    } else if (country) {
        const exams = await Exam.find({ country: country}).lean();
    } else if (country && startTime) {
        const exams = await Exam.find({ country: country, exam_start_time:startTime}).lean();
    } else if (country && examDate) {
        const exams = await Exam.find({ country: country, exam_date: examDate}).lean();
    } else if (country && examDate && startTime) {
        const exams = await Exam.find({ country: country, exam_date: examDate, exam_start_time:startTime}).lean();
    } else if (country && subject) {
        const exams = await Exam.find({ country: country, subject_id:subject}).lean();
    } else if (country && subject && startTime) {
        const exams = await Exam.find({ country: country, subject_id:subject, exam_start_time:startTime}).lean();
    } else if (country && subject && examDate) {
        const exams = await Exam.find({ country: country, subject_id:subject, exam_date: examDate}).lean();
    } else {
        const exams = '';
    }

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
