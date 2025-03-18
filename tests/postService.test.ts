// tests/integration/posts.test.ts
import request from "supertest";
import app from "../src/index";
import { PostRepository } from "../src/repositories/postRepository";
import jwt from "jsonwebtoken";
import { pool } from "../src/config/db";
import { PrismaClient } from "@prisma/client";

// Mock completo do Prisma Client
jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn(() => ({
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
      postVote: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    })),
  };
});

jest.mock("../src/repositories/postRepository");
jest.mock("../src/config/db");

const mockPostRepository = PostRepository as jest.MockedClass<
  typeof PostRepository
>;
const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe("Posts Routes", () => {
  const mockPost = {
    id: 1,
    title: "Test Post",
    content: "Test Content",
    authorId: 1,
    createdAt: new Date(),
    votes: [],
  };

  const mockPostVote = {
    id: 1,
    postId: 1,
    userId: 1,
    voteType: "upvote",
    createdAt: new Date(),
  };

  let authToken: string;

  beforeAll(() => {
    authToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "secret");
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mocks do PostRepository
    mockPostRepository.prototype.createPost.mockResolvedValue(mockPost);
    mockPostRepository.prototype.getPosts.mockResolvedValue([mockPost]);
    mockPostRepository.prototype.getPostById.mockResolvedValue(mockPost);
    mockPostRepository.prototype.updatePost.mockResolvedValue(mockPost);
    mockPostRepository.prototype.deletePost.mockResolvedValue({ count: 1 });

    // Configurar mocks do Prisma
    (mockPrisma.post.create as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);
    (mockPrisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.post.update as jest.Mock).mockResolvedValue(mockPost);
    (mockPrisma.post.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

    // Mockar operações de voto
    (mockPrisma.postVote.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.postVote.create as jest.Mock).mockResolvedValue(mockPostVote);
    (mockPrisma.postVote.update as jest.Mock).mockResolvedValue(mockPostVote);
    (mockPrisma.postVote.delete as jest.Mock).mockResolvedValue(mockPostVote);

    // Mockar pool.query para operações de voto
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [] }) // Verificar voto existente
      .mockResolvedValueOnce({ rows: [{}] }); // Criar novo voto
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("POST /posts", () => {
    it("deve criar post com autenticação (201)", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Post",
          content: "Test Content",
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        message: "Post criado com sucesso",
        post: {
          title: "Test Post",
          content: "Test Content",
        },
      });
    });

    it("deve recusar post sem título (400)", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ content: "Test Content" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Título e conteúdo são obrigatórios"
      );
    });
  });

  describe("GET /posts", () => {
    it("deve listar todos os posts (200)", async () => {
      const response = await request(app).get("/posts");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /posts/:postId/vote", () => {
    it("deve registrar voto válido (200)", async () => {
      const response = await request(app)
        .post("/posts/1/vote")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ voteType: "upvote" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Voto registrado");
    });

    it("deve retornar erro para voto inválido (400)", async () => {
      const response = await request(app)
        .post("/posts/1/vote")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ voteType: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
});
