import { memo, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import VoteButtons from "./VoteButtons";
import { deleteComment } from "../services/api";

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  authorName: string;
  score: number;
  userVote: "upvote" | "downvote" | null;
  votes: Array<{
    voteType: "upvote" | "downvote";
    userId: number;
  }>;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onDeleteComment: (commentId: string) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

const CommentItem = memo(
  ({
    comment,
    postId,
    onDeleteComment,
    currentUserId,
    isAdmin,
  }: CommentItemProps) => {
    const theme = useTheme();
    const [commentScore, setCommentScore] = useState(comment.score);
    const [commentVote, setCommentVote] = useState(comment.userVote);

    const handleDelete = async () => {
      if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
        try {
          await deleteComment(postId, comment.id);
          onDeleteComment(comment.id);
        } catch (error) {
          console.error("Erro ao deletar comentário:", error);
        }
      }
    };

    return (
      <Card
        sx={{
          mb: 2,
          boxShadow: 0,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              sx={{
                minWidth: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <VoteButtons
                targetId={comment.id}
                type="comment"
                initialScore={comment.score}
                initialVote={comment.userVote}
                onVoteUpdate={(newScore, newVote) => {
                  setCommentScore(newScore);
                  setCommentVote(newVote);
                }}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-line",
                    lineHeight: 1.6,
                    mb: 1.5,
                    flexGrow: 1,
                    pr: 2,
                  }}
                >
                  {comment.content}
                </Typography>

                {(currentUserId === comment.authorId || isAdmin) && (
                  <IconButton
                    onClick={handleDelete}
                    size="small"
                    sx={{
                      color: theme.palette.error.main,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      mt: -1,
                      mr: -1,
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "0.8rem",
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {comment.authorName[0]}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {comment.authorName}
                </Typography>

                {currentUserId === comment.authorId && (
                  <>
                    <Typography variant="caption">•</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.success.main,
                        fontWeight: 500,
                      }}
                    >
                      Seu comentário
                    </Typography>
                  </>
                )}

                <Typography variant="caption">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }
);

export default CommentItem;
