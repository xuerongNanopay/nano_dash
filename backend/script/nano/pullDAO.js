const axios = require('axios');
const https = require('https');

exports.digWebAgent = async ({token, url, query}) => {
  const axios_conn = axios.create({
    baseURL: url,
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    }),
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  return await axios_conn.get(query);
}



