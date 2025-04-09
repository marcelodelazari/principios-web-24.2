// frontend/src/models/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  createdAt: Date;
}

export interface Vote {
  voteType: "upvote" | "downvote";
  userId: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatarUrl?: string; // Adicionado avatarUrl
  };
  authorId: string;
  createdAt: string;
  votes: Array<{
    voteType: "upvote" | "downvote";
    userId: number;
  }>;
  score: number;
  commentsCount: number;
  userVote?: "upvote" | "downvote" | null;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl?: string; // Adicionado o campo para o avatar do autor
  score: number;
  userVote: "upvote" | "downvote" | null;
  votes: Array<{
    voteType: "upvote" | "downvote";
    userId: number;
  }>;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type VoteType = "upvote" | "downvote" | null;

export interface VoteResponse {
  newScore: number;
  userVote: VoteType;
}
