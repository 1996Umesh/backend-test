require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const CountryDirector = require('./models/countrydirector');

exports.handler = async () => {
  try {
    await connectDB();
    const directors = await CountryDirector.find().lean();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(directors),
    };
  } catch (error) {
    console.error("Error fetching country directors:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};
