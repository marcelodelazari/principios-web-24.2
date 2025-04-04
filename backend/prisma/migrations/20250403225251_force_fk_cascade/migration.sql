BEGIN;

-- Remova constraints antigas
ALTER TABLE "Comment" 
  DROP CONSTRAINT IF EXISTS "Comment_postId_fkey",
  DROP CONSTRAINT IF EXISTS "Comment_postId_fkey1"; -- Caso existam versões duplicadas

ALTER TABLE "PostVote" 
  DROP CONSTRAINT IF EXISTS "PostVote_postId_fkey";

ALTER TABLE "CommentVote" 
  DROP CONSTRAINT IF EXISTS "CommentVote_commentId_fkey";

-- Recrie com CASCADE
ALTER TABLE "Comment" 
  ADD CONSTRAINT "Comment_postId_fkey" 
  FOREIGN KEY ("postId") 
  REFERENCES "Post"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE "PostVote" 
  ADD CONSTRAINT "PostVote_postId_fkey" 
  FOREIGN KEY ("postId") 
  REFERENCES "Post"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE "CommentVote" 
  ADD CONSTRAINT "CommentVote_commentId_fkey" 
  FOREIGN KEY ("commentId") 
  REFERENCES "Comment"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

COMMIT;