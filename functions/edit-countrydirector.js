require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const bcrypt = require('bcryptjs');
const CountryDirector = require('../models/countrydirector');

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

    const { id, country, countrydirector_name, countrydirector_email, phone, countrydirector_password } = JSON.parse(event.body);

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
      country,
      countrydirector_name,
      countrydirector_email,
      phone,
    };

    if (countrydirector_password && countrydirector_password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(countrydirector_password, 10);
      updateData.countrydirector_password = hashedPassword;
    }

    const updated = await CountryDirector.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        },
        body: JSON.stringify({ error: 'Director not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Country Director updated successfully', director: updated }),
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
