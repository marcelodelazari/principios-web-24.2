// tests/userLogin.test.ts

import request from "supertest";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import app from "../src/index"; // Importa o app (sem iniciar o servidor automaticamente em ambiente de teste)
import { Server } from "http";

const prisma = new PrismaClient();
let server: Server;

jest.setTimeout(30000); // Aumenta o timeout para 30 segundos, se necessário

describe("User Login using Prisma", () => {
  beforeAll(async () => {
    // Limpa a tabela de usuários antes de rodar os testes
    await prisma.user.deleteMany({});

    // Insere um usuário de teste utilizando o Prisma
    const passwordHash = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        passwordHash,
        createdAt: new Date(),
      },
    });

    // Inicia o servidor em uma porta diferente (3001) para os testes
    server = app.listen(3001, () => {
      console.log("🔥 Servidor de teste rodando na porta 3001");
    });
  });

  beforeEach(async () => {
    // Garante que cada teste inicie com o usuário presente
    await prisma.user.deleteMany({});
    const passwordHash = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        passwordHash,
        createdAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await prisma.$disconnect();
  });

  it("should log in an existing user successfully", async () => {
    const response = await request(app).post("/login").send({
      email: "testuser@example.com",
      password: "password123",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Login bem-sucedido");
    expect(response.body).toHaveProperty("token");
  });

  it("should return error for invalid email", async () => {
    const response = await request(app).post("/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Usuário não encontrado");
  });

  it("should return error for invalid password", async () => {
    const response = await request(app).post("/login").send({
      email: "testuser@example.com",
      password: "wrongpassword",
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Senha incorreta");
  });
});
