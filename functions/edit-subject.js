require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const bcrypt = require('bcryptjs');
const Subject = require('../models/subject');

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'PUT, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();

    const { id, subject } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        },
        body: JSON.stringify({ error: 'ID is required' }),
      };
    }

    const updateData = {
        subject
    };

    const updated = await Subject.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        },
        body: JSON.stringify({ error: 'Subject not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Subject updated successfully', subject: updated }),
    };

  } catch (err) {
    console.error('❌ Error updating director:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
