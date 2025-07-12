exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
      // Handle preflight
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://f-end-test.netlify.app', // Or use your frontend domain
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
        body: '',
      };
    }
  
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://f-end-test.netlify.app', // Or 'https://f-end-test.netlify.app'
      },
      body: JSON.stringify({ message: "Hello from Netlify!" }),
    };
  };
  