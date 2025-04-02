import { PrismaClient, VoteType } from "@prisma/client";

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

  // Método para listar todos os posts com score calculado
  async getPosts(currentUserId?: number) {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { name: true } },
        votes: {
          where: currentUserId ? { userId: currentUserId } : undefined,
          select: { voteType: true },
        },
        _count: { select: { comments: true } }, // Remover contagem de votes aqui
      },
      orderBy: { createdAt: "desc" },
    });

    return posts;
  }

  // Método para calcular o score
  private calculateScore(votes: Array<{ voteType: VoteType }>) {
    return votes.reduce((acc, vote) => {
      return vote.voteType === "upvote" ? acc + 1 : acc - 1;
    }, 0);
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
  async updatePost(
    postId: string,
    authorId: string,
    title: string,
    content: string
  ) {
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

  // Método para lidar com votos com transação
  async handleVote(postId: number, userId: number, voteType: VoteType | null) {
    return prisma.$transaction(async (tx) => {
      // 1. Encontrar voto existente
      const existingVote = await tx.postVote.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      // 2. Executar operação de voto
      if (existingVote) {
        if (voteType === null) {
          await tx.postVote.delete({
            where: { id: existingVote.id },
          });
        } else {
          await tx.postVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          });
        }
      } else if (voteType) {
        await tx.postVote.create({
          data: { postId, userId, voteType },
        });
      }

      // 3. Buscar votos atualizados
      const updatedVotes = await tx.postVote.findMany({
        where: { postId },
        select: { voteType: true },
      });

      // 4. Calcular novo score
      const newScore = updatedVotes.reduce((acc, vote) => {
        return vote.voteType === "upvote" ? acc + 1 : acc - 1;
      }, 0);

      return {
        newScore,
        userVote: voteType,
      };
    });
  }
}
