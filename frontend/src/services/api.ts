// frontend/src/services/api.ts

import axios, { AxiosError } from "axios";
import {
  Post,
  Comment,
  User,
  AuthResponse,
  VoteResponse,
  VoteType,
} from "../models";

// Configure a URL base correta do backend
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:3000", // Porta padrão caso env não esteja definido
  timeout: 10000, // Timeout para evitar requisições pendentes por muito tempo
});

// Interceptor para incluir o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("[FRONTEND] Token enviado no cabeçalho:", token); // Log para verificar o token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros comuns
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Redirecionar para login se token expirou
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Posts
export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get<Post[]>("/posts");
    return response.data.map((post) => ({
      ...post,
      score: post.score || 0,
      userVote: post.userVote || null,
    }));
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    throw error;
  }
};

export const getPostById = async (postId: string): Promise<Post> => {
  try {
    const response = await api.get<Post>(`/posts/${postId}`);
    return {
      ...response.data,
      score: response.data.score || 0,
      userVote: response.data.userVote || null,
    };
  } catch (error) {
    console.error(`Erro ao buscar post ${postId}:`, error);
    throw error;
  }
};

export const createPost = async (
  title: string,
  content: string
): Promise<Post> => {
  try {
    const response = await api.post<Post>("/posts", { title, content });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar post:", error);
    throw error;
  }
};

export const updatePost = async (
  postId: string,
  title: string,
  content: string
): Promise<Post> => {
  try {
    const response = await api.put<Post>(`/posts/${postId}`, {
      title,
      content,
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar post ${postId}:`, error);
    throw error;
  }
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await api.delete(`/posts/${postId}`);
  } catch (error) {
    console.error(`Erro ao deletar post ${postId}:`, error);
    throw error;
  }
};

// Comentários
export const getCommentsByPost = async (postId: string): Promise<Comment[]> => {
  try {
    const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
    return response.data.map((comment) => ({
      ...comment,
      score: comment.score || 0,
      userVote: comment.userVote || null,
    }));
  } catch (error) {
    console.error(`Erro ao buscar comentários do post ${postId}:`, error);
    throw error;
  }
};

export const createComment = async (
  postId: string,
  content: string
): Promise<Comment> => {
  try {
    const response = await api.post<Comment>(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao criar comentário no post ${postId}:`, error);
    throw error;
  }
};

export const deleteComment = async (
  postId: string,
  commentId: string
): Promise<void> => {
  try {
    await api.delete(`/posts/${postId}/comments/${commentId}`);
  } catch (error) {
    console.error(`Erro ao deletar comentário ${commentId}:`, error);
    throw error;
  }
};

// Votos
export const votePost = async (
  postId: string,
  voteType: VoteType
): Promise<VoteResponse> => {
  try {
    const response = await api.post<VoteResponse>(`/posts/${postId}/vote`, {
      voteType,
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao votar no post ${postId}:`, error);
    throw error;
  }
};

export const voteComment = async (
  postId: string,
  commentId: string,
  voteType: VoteType
): Promise<VoteResponse> => {
  try {
    const response = await api.post<VoteResponse>(
      `/posts/${postId}/comments/${commentId}/vote`,
      { voteType }
    );
    return response.data;
  } catch (error) {
    console.error(`Erro ao votar no comentário ${commentId}:`, error);
    throw error;
  }
};

// Autenticação
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/register", userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return null;
  }
};

export const updateProfile = async (
  userId: number,
  data: {
    name?: string;
    bio?: string;
    location?: string;
  }
): Promise<User> => {
  const response = await api.put(`/users/${userId}/profile`, data);
  return response.data;
};

export const uploadAvatar = async (
  userId: number,
  file: File
): Promise<User> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await api.post(`/users/${userId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.user;
};

export const getUserProfile = async (userId: number): Promise<User> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Função para processar login via Google (usado quando o usuário é redirecionado de volta do Google)
export const processGoogleLogin = async (
  code: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/google/login", { code });
    return response.data;
  } catch (error) {
    console.error("Erro ao processar login do Google:", error);
    throw error;
  }
};

// Função para verificar se o usuário está sendo redirecionado do Google (com parâmetro 'code' na URL)
export const checkGoogleRedirect = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("code");
};

export default api;
