require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Examiner = require('../models/examiner');
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
    const auth = authorize(event, ['examiner']);
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

    const examiner = await Examiner.findById(userId).select('-examiner_password');

    if (!examiner) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Examiner not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        examiner_id: examiner._id,
        examiner_email: examiner.examiner_email,
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
