import axios from 'axios';

const client = ({ req }) => {
  if (typeof window === 'undefined') {
    //were are on the server
    return axios.create({
      baseURL: 'http://www.ms-ticketing-app-prod.xyz',
      headers: req.headers,
    });
  } else {
    //we must be on the browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default client;
//local url:ingress-nginx-controller.ingress-nginx.svc.cluster.local
