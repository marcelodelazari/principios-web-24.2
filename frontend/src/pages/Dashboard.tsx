import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  useTheme,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPosts, deletePost } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import VoteButtons from "../components/VoteButtons";

interface Post {
  id: string;
  title: string;
  content: string;
  author: { name: string };
  createdAt: string;
  votes: Array<{ voteType: "upvote" | "downvote" }>;
  score: number;
  commentsCount: number;
  userVote?: "upvote" | "downvote" | null;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user?.id]); // Atualiza quando o ID do usuário muda

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#2d2d2d",
          color: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          mb: 4,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            MeuFórum
          </Typography>

          <Stack direction="row" spacing={2}>
            {user && (
              <Button
                component={Link}
                to="/create-post"
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#404040",
                  "&:hover": { bgcolor: "#505050" },
                }}
              >
                Novo Post
              </Button>
            )}
            {user ? (
              <Button
                onClick={logout}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  color: "#fff",
                  borderColor: "#666",
                  "&:hover": { borderColor: "#888" },
                }}
              >
                Sair
              </Button>
            ) : (
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#404040",
                    "&:hover": { bgcolor: "#505050" },
                  }}
                >
                  Entrar
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: "#fff",
                    borderColor: "#666",
                    "&:hover": {
                      borderColor: "#888",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                  }}
                >
                  Criar Conta
                </Button>
              </Stack>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight="600" mb={3}>
          {user
            ? `Olá, ${user.name}${user.isAdmin ? " (Administrador)" : ""}`
            : "Bem-vindo ao Fórum"}
        </Typography>

        <Typography variant="h6" fontWeight="700" mb={2}>
          Discussões Recentes
        </Typography>

        {loading ? (
          <Typography>Carregando posts...</Typography>
        ) : posts.length === 0 ? (
          <Typography>Nenhum post encontrado</Typography>
        ) : (
          posts.map((post, index) => {
            const isAuthor = user && post.author.name === user.name;
            const showDelete = isAuthor || user?.isAdmin;

            return (
              <Box key={post.id} sx={{ mb: 2, position: "relative" }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
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

                  <Box sx={{ flex: 1 }}>
                    <Box
                      component={Link}
                      to={`/posts/${post.id}`}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "block",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="700"
                        sx={{
                          fontSize: "1.5rem",
                          mb: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 1.5,
                        }}
                      >
                        {post.content}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1.5,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          Postado por {post.author?.name}
                        </Typography>

                        {isAuthor && (
                          <>
                            <Typography variant="caption">•</Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: theme.palette.success.main,
                                fontWeight: 500,
                              }}
                            >
                              Seu post
                            </Typography>
                          </>
                        )}

                        <Typography variant="caption">•</Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {new Date(post.createdAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </Typography>
                        <Typography variant="caption">•</Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {post.commentsCount} comentário
                          {post.commentsCount !== 1 && "s"}
                        </Typography>
                      </Box>

                      {showDelete && (
                        <IconButton
                          onClick={() => handleDeletePost(post.id)}
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>

                {index < posts.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            );
          })
        )}
      </Container>
    </>
  );
}
