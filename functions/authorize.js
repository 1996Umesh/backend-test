const jwt = require('jsonwebtoken');

function authorize(event, allowedRoles = []) {
  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing token' }) };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!allowedRoles.includes(decoded.role)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Access denied: insufficient permissions' }) };
    }

    return { success: true, user: decoded }; // includes userId and role
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
  }
}
