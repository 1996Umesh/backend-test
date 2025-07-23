require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const CountryDirector = require('../models/countrydirector');
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
    const auth = authorize(event, ['countrydirector']);
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

    const countrydirector = await CountryDirector.findById(userId).select('-countrydirector_password');

    if (!countrydirector) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Countrydirector not found' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        countrydirector_id: countrydirector._id,
        countrydirector_email: countrydirector.countrydirector_email,
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
