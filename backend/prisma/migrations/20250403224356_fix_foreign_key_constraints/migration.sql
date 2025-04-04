-- Adicione constraints com CASCADE
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_postId_fkey";
ALTER TABLE "CommentVote" DROP CONSTRAINT "CommentVote_commentId_fkey";

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;