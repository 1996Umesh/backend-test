require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const bcrypt = require('bcryptjs');
const Examiner = require('../models/examiner');

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

    const { id, examiner_name, subject_id, examiner_email, examiner_password } = JSON.parse(event.body);

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
        examiner_name,
        subject_id,
        examiner_email,
        examiner_password,
    };

    if (examiner_password && examiner_password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(examiner_password, 10);
      updateData.examiner_password = hashedPassword;
    }

    const updated = await Examiner.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        },
        body: JSON.stringify({ error: 'Examiner not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Examiner updated successfully', examiner: updated }),
    };

  } catch (err) {
    console.error('❌ Error updating examiner:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
