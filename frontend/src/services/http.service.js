import Axios from "axios";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api/"
    : "http://localhost:3030/api/";

const axios = Axios.create({
  withCredentials: true,
});

export const httpService = {
  get(endpoint, data) {
    return ajax(endpoint, "GET", data);
  },
  post(endpoint, data) {
    return ajax(endpoint, "POST", data);
  },
  put(endpoint, data) {
    return ajax(endpoint, "PUT", data);
  },
  patch(endpoint, data) {
    return ajax(endpoint, "PATCH", data);
  },
  delete(endpoint, data) {
    return ajax(endpoint, "DELETE", data);
  },
};

async function ajax(endpoint, method = "GET", data = null) {
  const res = await axios({
    url: `${BASE_URL}${endpoint}`,
    method,
    data,
    params: method === "GET" ? data : null,
  });
  return res.data;
}
