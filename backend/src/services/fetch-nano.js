const axios = require('axios');

const fetchAnalyticEvents = async () => {
  const url = 'http://localhost:8080/service/dig?dao=intuitTransactionSummaryDAO&cmd=select&format=csv&limit=0&q=has:payeeSummary';
  const headers = {
    Authorization: 'Bearer',
    Cookie: 'dd'
  }
  try {
    const response = axios.get(url, headers);
    console.log(response.data);
  } catch ( err ) {
    console.log('err', err);
  }
}

exports.fetchAnalyticEvents = fetchAnalyticEvents;