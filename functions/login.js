const jwt = require('jsonwebtoken');
require('dotenv').config(); // ✅ loads .env variables

exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);

  // ⚠️ Replace with your actual user check
  if (email === 'admin@example.com' && password === '123456') {
    const payload = {
      userId: 'user123',
      role: 'superadmin'
    };

    // ✅ SIGN the JWT using the secret
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }
};
