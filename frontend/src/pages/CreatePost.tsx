import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Você precisa estar logado para criar um post");
      return;
    }

    try {
      await axios.post(
        "/posts",
        {
          title,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar post");
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Criar Novo Post
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título"
            variant="outlined"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Conteúdo"
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" size="large">
              Publicar
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/")}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}
