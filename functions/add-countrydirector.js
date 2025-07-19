const connectDB = require('./connect');
const CountryDirector = require('./models/countrydirector');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  await connectDB();

  try {
    const data = JSON.parse(event.body);

    const requiredFields = ['country', 'countrydirector_name', 'phone', 'countrydirector_email', 'countrydirector_password'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: `Missing field: ${field}` }),
        };
      }
    }

    const hashedPassword = await bcrypt.hash(data.countrydirector_password, 10);

    const newDirector = new CountryDirector({
      ...data,
      countrydirector_password: hashedPassword,
    });

    await newDirector.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Country Director created successfully!' }),
    };
  } catch (err) {
    console.error('❌ Server Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
