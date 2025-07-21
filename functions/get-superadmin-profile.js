require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('./connect');
const Superadmin = require('../models/superadmin');

exports.handler = async (event) => {
    const { id } = event.queryStringParameters;
  
    try {
      await connectDB();
      const user = await Superadmin.findById(id).lean();
  
      if (!user) {
        return { statusCode: 404, body: JSON.stringify({ error: "User not found" }) };
      }
  
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user),
      };
  
    } catch (err) {
      console.error("Error:", err);
      return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
    }
  };