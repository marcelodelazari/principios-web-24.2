import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Backend URL
});

export const getPosts = async () => {
  const response = await api.get("/posts");
  return response.data;
};

// Add other API calls here later
