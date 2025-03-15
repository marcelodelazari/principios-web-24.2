import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/index"; // Usa o mesmo arquivo index.ts
const prisma = new PrismaClient();

describe("User Registration", () => {
  beforeAll(async () => {
    // Limpa a tabela de usuários antes dos testes
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user successfully", async () => {
    const userData = {
      name: "Test User",
      email: "register_test@example.com", // Email único para este teste
      password: "password123",
    };

    const response = await request(app)
      .post("/register") // Rota de registro
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty(
      "message",
      "Usuário criado com sucesso"
    );
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toBe(userData.email);
  });
});
