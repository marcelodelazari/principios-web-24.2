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
  Skeleton,
  Chip,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { getPosts, deletePost } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import VoteButtons from "../components/VoteButtons";
import { colors } from "../theme/colors";
import NavBar from "../components/NavBar";
import { Post } from "../models";
import UserAvatar from "../components/UserAvatar";

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

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
    <Box sx={{ minHeight: "100vh", bgcolor: colors.background.default }}>
      <NavBar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: colors.text.primary,
              fontSize: isMobile ? "2rem" : "2.5rem",
            }}
          >
            {user ? `Bem-vindo, ${user.name}` : "Últimas Discussões"}
          </Typography>
          {user?.isAdmin && (
            <Chip
              label="Administrador"
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                bgcolor: colors.status.success,
                color: colors.text.contrast,
              }}
            />
          )}
        </Box>

        {loading ? (
          [...Array(3)].map((_, index) => (
            <Box
              key={index}
              sx={{
                mb: 3,
                p: 3,
                bgcolor: colors.background.paper,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={40}
                sx={{ mb: 2 }}
              />
              <Skeleton variant="rectangular" width="80%" height={20} />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={100} height={20} />
              </Box>
            </Box>
          ))
        ) : posts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              bgcolor: colors.background.paper,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              Nenhum post encontrado
            </Typography>
            <Button
              component={Link}
              to="/create-post"
              variant="contained"
              sx={{
                borderRadius: 1,
                px: 4,
                bgcolor: colors.primary.main,
                "&:hover": { bgcolor: colors.primary.dark },
              }}
            >
              Criar Primeiro Post
            </Button>
          </Box>
        ) : (
          posts.map((post, index) => {
            const isAuthor = user && post.author.name === user.name;
            const showDelete = isAuthor || user?.isAdmin;

            return (
              <Box
                key={post.id}
                sx={{
                  mb: 3,
                  p: 3,
                  bgcolor: colors.background.paper,
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: "transform 0.2s",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <VoteButtons
                      targetId={post.id}
                      type="post"
                      initialScore={post.score}
                      initialVote={post.userVote}
                    />
                    <Chip
                      label={`${post.commentsCount} respostas`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      component={Link}
                      to={`/posts/${post.id}`}
                      sx={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mb: 1.5,
                          color: theme.palette.text.primary,
                          "&:hover": { color: theme.palette.primary.main },
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          mb: 2,
                          lineHeight: 1.6,
                        }}
                      >
                        {post.content}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <UserAvatar
                          name={post.author.name}
                          avatarUrl={post.author.avatarUrl}
                          size={28}
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component={Link}
                          to={`/profile/${post.authorId}`} // Redireciona para o perfil do autor
                          sx={{
                            textDecoration: "none",
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              color: theme.palette.primary.main,
                            },
                          }}
                        >
                          {post.author.name}
                        </Typography>
                        {isAuthor && (
                          <Chip
                            label="Seu post"
                            size="small"
                            color="success"
                            sx={{ borderRadius: 1, fontWeight: 500 }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <span>•</span>
                        {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                      {showDelete && (
                        <IconButton
                          onClick={() => handleDeletePost(post.id)}
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": { bgcolor: theme.palette.error.light },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
                {index < posts.length - 1 && (
                  <Divider sx={{ mt: 3, borderColor: theme.palette.divider }} />
                )}
              </Box>
            );
          })
        )}
      </Container>
    </Box>
  );
}
