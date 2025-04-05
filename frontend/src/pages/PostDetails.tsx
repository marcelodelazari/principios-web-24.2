import { useEffect, useState, ReactElement } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  useTheme,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import VoteButtons from "../components/VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  getPostById,
  getCommentsByPost,
  createComment,
  deleteComment,
  deletePost,
} from "../services/api";
import DeleteIcon from "@mui/icons-material/Delete";

interface Post {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  createdAt: string;
  votes: Array<{
    voteType: "upvote" | "downvote";
    userId: number;
  }>;
  score: number;
  commentsCount: number;
  userVote?: "upvote" | "downvote" | null; // Adicionado
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  authorName: string;
}

const handleDeletePost = async (postId: string) => {
  if (window.confirm("Tem certeza que deseja excluir este post?")) {
    try {
      await deletePost(postId);
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }
};

export default function PostDetails(): ReactElement {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          getPostById(postId!), // Usando o serviço API
          getCommentsByPost(postId!), // Usando o serviço API
        ]);

        const processedPost = {
          ...postData,
          id: postData.id.toString(),
          createdAt: new Date(postData.createdAt).toISOString(),
          authorId: postData.authorId.toString(),
        };

        const processedComments = commentsData.map((comment: any) => ({
          ...comment,
          id: comment.id.toString(),
          authorId: comment.authorId.toString(),
          createdAt: new Date(comment.createdAt).toISOString(),
        }));

        setPost(processedPost);
        setComments(processedComments);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const response = await axios.post(
        `/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const completeComment = {
        ...response.data,
        id: response.data.id.toString(),
        authorId: user.id.toString(),
        authorName: user.name,
        createdAt: new Date(response.data.createdAt).toISOString(),
      };

      setComments([completeComment, ...comments]);
      setNewComment("");
      if (post) {
        setPost({ ...post, commentsCount: post.commentsCount + 1 });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;
  if (!post) return <Typography>Post não encontrado</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 3,
          color: "text.primary",
          textTransform: "none",
          "&:hover": { backgroundColor: "transparent" },
        }}
      >
        Voltar para o Dashboard
      </Button>

      {/* Post Principal */}
      <Box sx={{ display: "flex", alignItems: "flex-start", mb: 4 }}>
        <Box
          sx={{
            mr: 2,
            minWidth: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div onClick={(e) => e.preventDefault()}>
            <VoteButtons
              postId={post.id}
              initialScore={post.score}
              initialVote={post.userVote}
            />
          </div>
        </Box>

        <Card sx={{ flex: 1, boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                fontSize: "1.5rem",
                mb: 1.5,
                lineHeight: 1.3,
                fontWeight: 700,
              }}
            >
              {post.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-line",
                lineHeight: 1.6,
                mb: 2.5,
                color: "text.secondary",
              }}
            >
              {post.content}
            </Typography>

            {user?.isAdmin && (
              <Button
                onClick={() => handleDeletePost(post.id)}
                startIcon={<DeleteIcon />}
                color="error"
                size="small"
                sx={{ ml: 2 }}
              >
                Deletar Post
              </Button>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: "0.8rem",
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {post.author.name[0]}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                Postado por {post.author.name}
              </Typography>
              <Typography variant="caption">•</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </Typography>
              <Typography variant="caption">•</Typography>
              <Typography variant="caption" color="text.secondary">
                {post.commentsCount} comentário{post.commentsCount !== 1 && "s"}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Seção de Comentários */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Comentários ({post.commentsCount})
        </Typography>

        {user && (
          <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
            <CardContent>
              <Box
                component="form"
                onSubmit={handleCommentSubmit}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Escreva seu comentário"
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 500 }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {newComment.length}/500 caracteres
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    sx={{ textTransform: "none" }}
                  >
                    Publicar comentário
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {comments.map((comment) => (
          <Card
            key={comment.id}
            sx={{
              mb: 2,
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
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

                {(user?.id.toString() === comment.authorId ||
                  user?.isAdmin) && (
                  <IconButton
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Tem certeza que deseja excluir este comentário?"
                        )
                      ) {
                        try {
                          await deleteComment(postId!.toString(), comment.id);
                          setComments((prev) =>
                            prev.filter((c) => c.id !== comment.id)
                          );
                          if (post) {
                            setPost({
                              ...post,
                              commentsCount: post.commentsCount - 1,
                            });
                          }
                        } catch (error) {
                          console.error("Erro ao deletar comentário:", error);
                        }
                      }
                    }}
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

                {user?.id.toString() === comment.authorId && (
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
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
