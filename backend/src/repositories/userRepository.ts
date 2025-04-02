import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserRepository {
  async createUser(name: string, email: string, passwordHash: string) {
    return prisma.user.create({
      data: { name, email, passwordHash },
    });
  }

  async getUserById(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(userId: number, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async deleteUser(userId: number) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}
