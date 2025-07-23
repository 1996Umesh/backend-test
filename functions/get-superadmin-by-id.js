require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Superadmin = require('../models/superadmin');
const authorize = require('./authorize');

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    await connectDB();

    // 🛡️ Check role
    const auth = authorize(event, ['superadmin']);
    if (!auth.success) return auth;

    const userId = event.queryStringParameters.id;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' }),
      };
    }

    const superadmin = await Superadmin.findById(userId).select('-superadmin_password'); // omit password

    if (!superadmin) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Superadmin not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({
        superadmin_id: superadmin._id,
        superadmin_email: superadmin.superadmin_email,
      })
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
