import { PrismaClient, VoteType } from "@prisma/client";
import { PostRepository } from "../repositories/postRepository";

const prisma = new PrismaClient();

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

  // Método para listar todos os posts
  async getPosts(currentUserId?: number) {
    const posts = await this.postRepository.getPosts(currentUserId);

    return posts.map((post) => ({
      ...post,
      id: post.id.toString(),
      authorId: post.authorId.toString(),
      score: post.votes.reduce((acc, vote) => {
        // Cálculo correto
        return vote.voteType === "upvote" ? acc + 1 : acc - 1;
      }, 0),
      commentsCount: post._count.comments,
      userVote: post.votes[0]?.voteType || null,
    }));
  }

  // Método para obter post por ID
  async getPostById(postId: string) {
    const post = await this.postRepository.getPostById(postId);

    if (!post) return null;

    return {
      ...post,
      id: post.id.toString(),
      authorId: post.authorId.toString(),
      score: post.votes.reduce((acc, vote) => {
        return vote.voteType === "upvote" ? acc + 1 : acc - 1;
      }, 0),
      commentsCount: post._count.comments,
      userVote: post.votes[0]?.voteType || null,
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
  async deletePost(postId: string, authorId: string) {
    return this.postRepository.deletePost(postId, authorId);
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
