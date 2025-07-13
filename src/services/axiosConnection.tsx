import axios from "axios";

const token = sessionStorage.getItem("token");
console.log(token);

const baseURL = "http://localhost:4000/";

const client = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/posts",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export const getService = async (endpoint:string) => {
  const response = await client.get(baseURL + endpoint);
  return response;
};

export const postService = async (endpoint:string, data:object) => {
  const response = await client.post(baseURL + endpoint, data);
  return response;
};

export const patchService = async (endpoint:string, data:object) => {
  const response = await client.patch(baseURL + endpoint, data);
  return response;
};
