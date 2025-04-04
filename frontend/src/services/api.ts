import axios from "axios";

// Configure a URL base correta do backend
const api = axios.create({
  baseURL: "http://localhost:3000", // Porta do backend
});

// Adicione interceptor para incluir o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getPosts = async () => {
  const response = await api.get("/posts");
  return response.data.map((post: any) => ({
    ...post,
    score: post.score || 0,
    userVote: post.userVote || null,
  }));
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/login", { email, password });
  return response.data;
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await axios.post("/register", userData);
  return response.data;
};
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/me");

    if (response.status === 401) {
      localStorage.removeItem("token");
      return null;
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return null;
  }
};

export const getPostById = async (postId: string) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const getCommentsByPost = async (postId: string) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createComment = async (postId: string, content: string) => {
  const response = await api.post(`/posts/${postId}/comments`, { content });
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};
