import request from "supertest";
import app from "../src/index";
import { PostRepository } from "../src/repositories/postRepository";
import jwt from "jsonwebtoken";
import { PrismaClient, Post, PostVote, VoteType } from "@prisma/client";
import { pool } from "../src/config/db";

jest.mock("../src/repositories/postRepository");
jest.mock("../src/config/db");
jest.mock("@prisma/client");

const mockPost: Post & { 
  votes: PostVote[];
  author: { name: string };
  _count: { comments: number };
  comments: any[]; // Adicionar esta linha
} = {
  id: 1,
  title: "Test Post",
  content: "Test Content",
  authorId: 1,
  createdAt: new Date(),
  votes: [],
  author: {
    name: "Test Author"
  },
  _count: {
    comments: 0
  },
  comments: [] // Adicionar array vazio
};

describe("Posts Routes", () => {
  let authToken: string;
  const mockPostRepository = PostRepository as jest.MockedClass<typeof PostRepository>;

  beforeAll(() => {
    authToken = jwt.sign({ userId: 1 }, "test_secret");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPostRepository.prototype.createPost.mockResolvedValue(mockPost);
    mockPostRepository.prototype.getPosts.mockResolvedValue([{
      ...mockPost,
      votes: [{ voteType: 'upvote', userId: 1 }]
    }]);
    mockPostRepository.prototype.getPostById.mockResolvedValue(mockPost);
    mockPostRepository.prototype.updatePost.mockResolvedValue(mockPost);
    mockPostRepository.prototype.deletePost.mockResolvedValue({
      ...mockPost,
      comments: [], // Garantir que existe
      votes: [] // Manter consistência
    });
    mockPostRepository.prototype.handleVote.mockResolvedValue({
      newScore: 1,
      userVote: VoteType.upvote,
    });
  });

  describe("POST /posts", () => {
    it("deve criar post com sucesso (201)", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "New Post",
          content: "Post Content",
        });

      expect(response.status).toBe(201);
      expect(mockPostRepository.prototype.createPost).toHaveBeenCalledWith(
        "New Post",
        "Post Content",
        expect.any(String)
      );
    });

    it("deve retornar erro sem autenticação (401)", async () => {
      const response = await request(app)
        .post("/posts")
        .send({ title: "New Post", content: "Content" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /posts", () => {
    it("deve listar posts (200)", async () => {
      const response = await request(app).get("/posts");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(mockPostRepository.prototype.getPosts).toHaveBeenCalled();
    });
  });

  describe("POST /posts/:postId/vote", () => {
    it("deve registrar voto (200)", async () => {
      const response = await request(app)
        .post("/posts/1/vote")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ voteType: "upvote" });

      expect(response.status).toBe(200);
      expect(mockPostRepository.prototype.handleVote).toHaveBeenCalledWith(
        1,
        1,
        "upvote"
      );
    });
  });
});