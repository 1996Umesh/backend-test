require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Exam = require('../models/exam');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();
    const { id } = event.queryStringParameters;

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID is required' }),
      };
    }

    await Exam.findByIdAndDelete(id);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
      },
      body: JSON.stringify({ message: 'Exam deleted successfully' }),
    };
  } catch (err) {
    console.error('❌ Error deleting Exam:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
