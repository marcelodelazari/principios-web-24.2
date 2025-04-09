import { PrismaClient, VoteType } from "@prisma/client";

const prisma = new PrismaClient();

export class CommentRepository {
  async createComment(postId: string, userId: string, content: string) {
    return prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),
        authorId: parseInt(userId),
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getCommentsByPost(postId: string) {
    return prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true, // Inclui o campo avatarUrl
          },
        },
        votes: {
          select: {
            voteType: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateComment(commentId: string, userId: string, content: string) {
    return prisma.comment.update({
      where: {
        id: parseInt(commentId),
        authorId: parseInt(userId),
      },
      data: { content },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const whereClause: any = {
      id: parseInt(commentId),
    };

    if (!isAdmin) {
      whereClause.authorId = parseInt(userId);
    }

    const deletedComment = await prisma.comment.deleteMany({
      where: whereClause,
    });

    return deletedComment.count > 0;
  }

  async handleVote(
    commentId: number,
    userId: number,
    voteType: VoteType | null
  ) {
    return prisma.$transaction(async (tx) => {
      const existingVote = await tx.commentVote.findUnique({
        where: { commentId_userId: { commentId, userId } },
      });

      if (existingVote) {
        if (voteType === null) {
          await tx.commentVote.delete({
            where: { id: existingVote.id },
          });
        } else {
          await tx.commentVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          });
        }
      } else if (voteType) {
        await tx.commentVote.create({
          data: { commentId, userId, voteType },
        });
      }

      const updatedVotes = await tx.commentVote.findMany({
        where: { commentId },
        select: { voteType: true },
      });

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
