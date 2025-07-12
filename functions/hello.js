exports.handler = async (event) => {
    // Handle preflight request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
        body: '',
      };
    }
  
    try {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: "Hello from Netlify!" }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: "Function error: " + error.message }),
      };
    }
  };
  


// require('dotenv').config();

// const uri = process.env.MONGO_URI;
// const allowedOrigin = process.env.FRONTEND_URL || '*';


// exports.handler = async (event) => {
//   if (event.httpMethod === 'OPTIONS') {
//     return {
//       statusCode: 200,
//       headers: {
//         'Access-Control-Allow-Origin': allowedOrigin,
//         'Access-Control-Allow-Headers': 'Content-Type',
//         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//       },
//       body: '',
//     };
//   }

//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': allowedOrigin,
//     },
//     body: JSON.stringify({ message: "Hello from Netlify!" }),
//   };
// };
