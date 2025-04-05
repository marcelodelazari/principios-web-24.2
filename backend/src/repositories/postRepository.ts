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
  // backend/src/repositories/postRepository.ts
  async getPosts(currentUserId?: number) {
    return prisma.post.findMany({
      include: {
        author: { select: { name: true } },
        votes: {
          select: {
            voteType: true,
            userId: true, // Adicionado para verificar o voto do usuário
          },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPostVotes(postId: number) {
    return prisma.postVote.findMany({
      where: { postId },
      select: { voteType: true },
    });
  }

  // Método para calcular o score
  private calculateScore(votes: Array<{ voteType: VoteType }>) {
    return votes.reduce((acc, vote) => {
      return vote.voteType === "upvote" ? acc + 1 : acc - 1;
    }, 0);
  }

  // Método para obter post por ID
  // backend/src/repositories/postRepository.ts

  async getPostById(postId: string, currentUserId?: number) {
    return prisma.post.findUnique({
      where: { id: parseInt(postId) },
      include: {
        author: { select: { name: true } },
        votes: {
          where: currentUserId ? { userId: currentUserId } : undefined,
          select: { voteType: true, userId: true }, // Adicionado userId
        },
        _count: { select: { comments: true } },
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

  async deletePost(postId: string, authorId: string, isAdmin: boolean) {
    const parsedPostId = Number(postId);
    const parsedAuthorId = Number(authorId);
    console.log(
      "[DEBUG] Post ID convertido:",
      parsedPostId,
      "Tipo:",
      typeof parsedPostId
    );

    // Validação reforçada
    if (isNaN(parsedPostId)) {
      throw new Error(`ID do post inválido: ${postId}`);
    }

    const whereClause: any = { id: parsedPostId };

    if (!isAdmin) {
      if (isNaN(parsedAuthorId)) {
        throw new Error(`ID do autor inválido: ${authorId}`);
      }
      whereClause.authorId = parsedAuthorId;
    }

    try {
      // Verificação explícita de existência
      const post = await prisma.post.findUnique({
        where: { id: parsedPostId },
      });

      console.log("[DEBUG] Post encontrado:", post);

      if (!post) {
        throw new Error(`Post ${parsedPostId} não encontrado`);
      }

      console.log("[DEBUG] Where clause final:", JSON.stringify(whereClause));

      return await prisma.post.delete({
        where: { id: parsedPostId },
        include: {
          comments: true,
          votes: true,
        },
      });
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      if (error.code === "P2025") {
        throw new Error("Post não encontrado com os critérios fornecidos");
      }
      throw new Error(`Falha ao deletar post: ${error.message}`);
    }
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
