// tests/integration/auth.test.ts
import request from "supertest";
import app from "../src/index";
import { pool } from "../src/config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock das dependências
jest.mock("../src/config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Routes", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    passwordHash: "hashed_password",
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
    (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked_jwt_token");
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Evitar vazamento de conexão
  });

  describe("POST /register", () => {
    it("deve registrar um novo usuário com sucesso (201)", async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // Verificação de email
        .mockResolvedValueOnce({ rows: [mockUser] }); // Inserção

      const response = await request(app).post("/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "ValidPass123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Usuário criado com sucesso",
        user: expect.objectContaining({
          email: "test@example.com",
          name: "Test User",
        }),
      });
    });

    it("deve retornar erro para senha curta (400)", async () => {
      const response = await request(app).post("/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "A senha deve ter pelo menos 6 caracteres",
      });
    });
  });

  describe("POST /login", () => {
    it("deve fazer login com credenciais válidas (200)", async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUser] }) // Validação do middleware
        .mockResolvedValueOnce({ rows: [mockUser] }); // Consulta do service

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "ValidPass123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Login bem-sucedido",
        token: "mocked_jwt_token",
      });
    });

    it("deve retornar erro para credenciais inválidas (400)", async () => {
      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockUser] })
        .mockResolvedValueOnce({ rows: [mockUser] });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Senha incorreta",
      });
    });
  });
});
