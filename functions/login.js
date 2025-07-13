require('dotenv').config();
const connectDB = require('./connect');
// const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Superadmin = require('../models/superadmin');

exports.handler = async (event) => {
  // CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    await connectDB();

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const { email, password } = JSON.parse(event.body);

    const admin = await Superadmin.findOne({ superadmin_email: email });

    if (!admin) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    const isMatch = await bcrypt.compare(password, admin.superadmin_password);
    if (!isMatch) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
        body: JSON.stringify({ error: 'Invalid email or password' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({
        message: 'Login successful',
        email: admin.superadmin_email,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*' },
      body: JSON.stringify({ error: 'Server error: ' + error.message }),
    };
  }
};
