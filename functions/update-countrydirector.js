require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const bcrypt = require('bcryptjs');
const CountryDirector = require('../models/countrydirector');

exports.handler = async (event) => {
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
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();
    const { id, country, countrydirector_name, countrydirector_email, phone, countrydirector_password } = JSON.parse(event.body);
    const hashedPassword = await bcrypt.hash(countrydirector_password, 10);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID is required' }),
      };
    }

    if(countrydirector_password != ''){
        const updatedDirector = await CountryDirector.findByIdAndUpdate(id, {
            country,
            countrydirector_name,
            countrydirector_email,
            phone,
            countrydirector_password: hashedPassword, // ideally you should hash it before saving
        }, { new: true });

    }else{
        const updatedDirector = await CountryDirector.findByIdAndUpdate(id, {
            country,
            countrydirector_name,
            countrydirector_email,
            phone,
            // countrydirector_password: hashedPassword, // ideally you should hash it before saving
        }, { new: true });
    }

    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(updatedDirector),
    };
  } catch (err) {
    console.error('❌ Error updating director:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
