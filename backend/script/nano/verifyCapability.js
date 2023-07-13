const { digWebAgent } = require('./digWebAgent')

async function getCapabilities(sourceId) {
  const url = "https://ca-prod-mediator1.nanopay.net:8443";
  const query = `service/dig?dao=analyticEventDAO&cmd=select&format=json&q=timestamp%3E%3D${digStart}%20AND%20timestamp%3C${digEnd}&limit=0`;

  
}

const fetchUserCapabilityJunction = async (token, sourceId) => {

}
