import axios from 'axios';

const client = ({ req }) => {
  if (typeof window === 'undefined') {
    //were are on the server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers,
    });
  } else {
    //we must be on the server
    return axios.create({
      baseURL: '/',
    });
  }
};

export default client;