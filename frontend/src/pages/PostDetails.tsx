import { useEffect, useState, ReactElement, useCallback, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  AppBar,
  Toolbar,
  Stack,
  useMediaQuery,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useAuth } from "../contexts/AuthContext";
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
import { colors } from "../theme/colors";

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
  userVote?: "upvote" | "downvote" | null;
}

interface Comment {
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

// Componente memorizado para comentário individual
const CommentItem = memo(
  ({
    comment,
    postId,
    onDeleteComment,
    currentUserId,
    isAdmin,
  }: {
    comment: Comment;
    postId: string;
    onDeleteComment: (commentId: string) => void;
    currentUserId?: string;
    isAdmin?: boolean;
  }) => {
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

// Componente de formulário memorizado para evitar re-renderizações
const CommentForm = memo(
  ({ onSubmit }: { onSubmit: (content: string) => void }) => {
    const [commentText, setCommentText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      onSubmit(commentText);
      setCommentText("");
    };

    return (
      <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              label="Escreva seu comentário"
              variant="outlined"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
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
                {commentText.length}/500 caracteres
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
    );
  }
);

// Componente principal
export default function PostDetails(): ReactElement {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          getPostById(postId!),
          getCommentsByPost(postId!),
        ]);

        const processedPost = {
          ...postData,
          id: postData.id.toString(),
          createdAt: new Date(postData.createdAt).toISOString(),
          authorId: postData.authorId?.toString(),
        };

        const processedComments = commentsData.map((comment: any) => ({
          ...comment,
          id: comment.id.toString(),
          authorId: comment.authorId.toString(),
          createdAt: new Date(comment.createdAt).toISOString(),
          score: comment.score,
          userVote: comment.userVote || null,
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

  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await deletePost(post.id);
        navigate("/");
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  }, [post, navigate]);

  const handleCommentSubmit = useCallback(
    async (content: string) => {
      if (!user || !postId) return;

      try {
        const response = await createComment(postId, content);

        const completeComment = {
          ...response,
          id: response.id.toString(),
          authorId: user.id.toString(),
          authorName: user.name,
          createdAt: new Date(response.createdAt).toISOString(),
          score: 0,
          userVote: null,
          votes: [],
        };

        setComments((prev) => [completeComment, ...prev]);
        if (post) {
          setPost((prev) =>
            prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null
          );
        }
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    },
    [user, postId, post]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (post) {
        setPost((prev) =>
          prev ? { ...prev, commentsCount: prev.commentsCount - 1 } : null
        );
      }
    },
    [post]
  );

  if (loading) return <Typography>Carregando...</Typography>;
  if (!post) return <Typography>Post não encontrado</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.background.default }}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: colors.primary.main,
          boxShadow: "none",
          borderBottom: `1px solid ${colors.primary.dark}`,
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}
          >
            <Typography
              variant="h4"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                letterSpacing: "-1px",
                color: colors.text.contrast,
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              TechForum
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {user && (
              <Button
                component={Link}
                to="/create-post"
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  bgcolor: colors.primary.dark,
                  "&:hover": { bgcolor: colors.primary.light },
                }}
              >
                Novo Post
              </Button>
            )}
            {user ? (
              <Button
                onClick={logout}
                variant="outlined"
                color="inherit"
                startIcon={<ExitToAppIcon />}
                sx={{
                  borderColor: colors.text.contrast,
                  color: colors.text.contrast,
                  "&:hover": { borderColor: colors.secondary.light },
                }}
              >
                Sair
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  color="inherit"
                  sx={{
                    borderColor: colors.text.contrast,
                    color: colors.text.contrast,
                    "&:hover": { borderColor: colors.secondary.light },
                  }}
                >
                  Entrar
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  sx={{
                    bgcolor: colors.primary.dark,
                    "&:hover": { bgcolor: colors.primary.light },
                  }}
                >
                  Registrar
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

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
                targetId={post.id}
                type="post"
                initialScore={post.score}
                initialVote={post.userVote}
                onVoteUpdate={(newScore, newVote) => {
                  setPost((prev) =>
                    prev
                      ? {
                          ...prev,
                          score: newScore,
                          userVote: newVote,
                        }
                      : null
                  );
                }}
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
                  onClick={handleDeletePost}
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
                  {post.commentsCount} comentário
                  {post.commentsCount !== 1 && "s"}
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

          {user && <CommentForm onSubmit={handleCommentSubmit} />}

          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId!}
              onDeleteComment={handleDeleteComment}
              currentUserId={user?.id.toString()}
              isAdmin={user?.isAdmin}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
