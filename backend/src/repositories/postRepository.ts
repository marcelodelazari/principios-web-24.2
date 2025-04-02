import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostRepository {
  // Método para criar post
  async createPost(title: string, content: string, authorId: string) {
    return prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId),
      },
    });
  }

  // Método para listar todos os posts
  async getPosts() {
    return prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Método para obter post por ID
  async getPostById(postId: string) {
    return prisma.post.findUnique({
      where: {
        id: parseInt(postId),
      },
    });
  }

  // Método para atualizar post
  async updatePost(postId: string, authorId: string, title: string, content: string) {
    return prisma.post.update({
      where: {
        id: parseInt(postId),
      },
      data: {
        title,
        content,
        authorId: parseInt(authorId),
      },
    });
  }

  // Método para deletar post
  async deletePost(postId: string, authorId: string) {
    return prisma.post.deleteMany({
      where: {
        id: parseInt(postId),
        authorId: parseInt(authorId),
      },
    });
  }
}
