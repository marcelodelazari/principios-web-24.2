import { PrismaClient } from '@prisma/client';
import { PostRepository } from '../repositories/postRepository';

const prisma = new PrismaClient();

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  // Método para criar post
  async createPost(title: string, content: string, authorId: string) {
    if (!title || !content) {
      throw new Error('Título e conteúdo são obrigatórios');
    }
    return this.postRepository.createPost(title, content, authorId);
  }

  // Método para listar todos os posts
  async getPosts() {
    return this.postRepository.getPosts();
  }

  // Método para obter post por ID
  async getPostById(postId: string) {
    return this.postRepository.getPostById(postId);
  }

  // Método para atualizar post
  async updatePost(postId: string, authorId: string, title: string, content: string) {
    return this.postRepository.updatePost(postId, authorId, title, content);
  }

  // Método para deletar post
  async deletePost(postId: string, authorId: string) {
    return this.postRepository.deletePost(postId, authorId);
  }

  // Método para votar em post
  async votePost(postId: string, userId: string, voteType: string) {
    const voteEnum = voteType === 'upvote' ? 'upvote' : 'downvote';

    const existingVote = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId: parseInt(userId),
        },
      },
    });

    if (existingVote) {
      if (existingVote.voteType === voteEnum) {
        await prisma.postVote.delete({
          where: {
            postId_userId: {
              postId: parseInt(postId),
              userId: parseInt(userId),
            },
          },
        });
        return { message: 'Voto removido' };
      } else {
        await prisma.postVote.update({
          where: {
            postId_userId: {
              postId: parseInt(postId),
              userId: parseInt(userId),
            },
          },
          data: { voteType: voteEnum },
        });
        return { message: 'Voto atualizado' };
      }
    } else {
      await prisma.postVote.create({
        data: {
          postId: parseInt(postId),
          userId: parseInt(userId),
          voteType: voteEnum,
        },
      });
      return { message: 'Voto registrado' };
    }
  }
}
