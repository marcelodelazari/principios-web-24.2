import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import { getPosts } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

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
  }, []);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          marginBottom: "2rem",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h6" component="h2">
          {user ? `Bem-vindo, ${user.name}` : "Bem-vindo, Visitante"}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {user && (
            <Button
              component={Link}
              to="/create-post"
              variant="contained"
              color="success"
            >
              Criar Post
            </Button>
          )}

          {user ? (
            <Button onClick={logout} variant="contained" color="secondary">
              Sair
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          )}
        </Box>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Últimos Posts
      </Typography>
      {loading ? (
        <Typography>Carregando posts...</Typography>
      ) : posts.length === 0 ? (
        <Typography>Nenhum post encontrado</Typography>
      ) : (
        posts.map((post) => (
          <Card
            component={Link}
            to={`/posts/${post.id}`}
            key={post.id}
            sx={{
              marginBottom: "1.5rem",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h5" component="h3" gutterBottom>
                {post.title}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  whiteSpace: "pre-line",
                  lineHeight: "1.6",
                }}
              >
                {post.content}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  marginTop: "1rem",
                  fontStyle: "italic",
                }}
              >
                Postado por {post.authorName} em{" "}
                {new Date(post.createdAt).toLocaleDateString("pt-BR")}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
