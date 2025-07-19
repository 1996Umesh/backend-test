const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const CountryDirector = require('./models/countrydirector');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB();

    const data = JSON.parse(event.body);
    const requiredFields = ['country', 'countrydirector_name', 'phone', 'countrydirector_email', 'countrydirector_password'];

    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ message: `Missing field: ${field}` }),
        };
      }
    }

    const hashedPassword = await bcrypt.hash(data.countrydirector_password, 10);

    const newCD = new CountryDirector({
      country: data.country,
      countrydirector_name: data.countrydirector_name,
      phone: data.phone,
      countrydirector_email: data.countrydirector_email,
      countrydirector_password: hashedPassword,
    });

    await newCD.save();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Country Director created successfully!' }),
    };
  } catch (err) {
    console.error("❌ Server Error:", err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
