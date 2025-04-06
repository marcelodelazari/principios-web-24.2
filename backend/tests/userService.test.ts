import request from "supertest";
import app from "../src/index";
import { pool } from "../src/config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

// Mock das dependências
jest.mock("../src/config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const mockUser: User = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  passwordHash: "hashed_password",
  isAdmin: false,
  createdAt: new Date(),
};

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
    (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mocked_jwt_token");
  });

  describe("POST /register", () => {
    it("deve retornar 400 para senha inválida", async () => {
      const response = await request(app)
        .post("/register")
        .send({
          name: "Test",
          email: "valid@example.com", // Email válido
          password: "123", // Senha inválida
        });
    
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: expect.stringMatching(/senha deve ter pelo menos 6 caracteres/i),
      });
    });

    it("deve retornar 400 para email já existente", async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

      const response = await request(app)
        .post("/register")
        .send({
          name: "Test User",
          email: mockUser.email,
          password: "ValidPass123",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Usuário já existe",
      });
    });
  });

  describe("POST /login", () => {
    it("deve retornar 200 e token JWT ao fazer login", async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

      const response = await request(app)
        .post("/login")
        .send({
          email: mockUser.email,
          password: "ValidPass123",
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: "mocked_jwt_token",
        user: expect.any(Object),
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, isAdmin: mockUser.isAdmin },
        expect.any(String),
        { expiresIn: "1h" }
      );
    });

    it("deve retornar 400 para credenciais inválidas", async () => {
      (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post("/login")
        .send({
          email: "invalid@example.com",
          password: "WrongPass",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Usuário não encontrado",
      });
    });
  });
});