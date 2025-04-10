import { VoteType } from "@prisma/client";
import { PostRepository } from "../repositories/postRepository";

import { prisma } from "../lib/prisma"; // ajusta o caminho conforme a pasta

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  // Método para criar post
  async createPost(title: string, content: string, authorId: string) {
    if (!title || !content) {
      throw new Error("Título e conteúdo são obrigatórios");
    }
    return this.postRepository.createPost(title, content, authorId);
  }

  // backend/src/services/postService.ts
  // backend/src/services/postService.ts
  async getPosts(currentUserId?: number) {
    const posts = await this.postRepository.getPosts(currentUserId);

    return posts.map((post) => {
      const totalScore = post.votes.reduce((acc, vote) => {
        return vote.voteType === "upvote" ? acc + 1 : acc - 1;
      }, 0);

      const userVote = currentUserId
        ? post.votes.find((v) => v.userId === currentUserId)?.voteType
        : null;

      return {
        ...post,
        id: post.id.toString(),
        authorId: post.authorId.toString(),
        author: {
          name: post.author.name,
          avatarUrl: post.author.avatarUrl, // Inclui o avatar do autor
        },
        score: totalScore,
        commentsCount: post._count.comments,
        userVote: userVote || null,
      };
    });
  }

  // Método para obter post por ID
  // backend/src/services/postService.ts

  async getPostById(postId: string, currentUserId?: number) {
    const post = await this.postRepository.getPostById(postId, currentUserId);

    if (!post) return null;

    const totalScore = post.votes.reduce((acc, vote) => {
      return vote.voteType === "upvote" ? acc + 1 : acc - 1;
    }, 0);

    const userVote = currentUserId
      ? post.votes.find((v) => v.userId === currentUserId)?.voteType
      : null;

    return {
      ...post,
      id: post.id.toString(),
      authorId: post.authorId.toString(),
      author: {
        name: post.author.name,
        avatarUrl: post.author.avatarUrl, // Inclui o avatar do autor
      },
      score: totalScore,
      commentsCount: post._count.comments,
      userVote: userVote || null,
    };
  }
  // Método para atualizar post
  async updatePost(
    postId: string,
    authorId: string,
    title: string,
    content: string
  ) {
    return this.postRepository.updatePost(postId, authorId, title, content);
  }

  // Método para deletar post
  async deletePost(postId: string, authorId: string, isAdmin: boolean) {
    return this.postRepository.deletePost(postId, authorId, isAdmin);
  }
  async votePost(postId: string, userId: string, voteType: string | null) {
    // Validação
    if (voteType && !["upvote", "downvote"].includes(voteType)) {
      throw new Error("Tipo de voto inválido");
    }

    return this.postRepository.handleVote(
      parseInt(postId),
      parseInt(userId),
      voteType as VoteType | null
    );
  }
}
