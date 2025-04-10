import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Container } from "@mui/material";
import { getCurrentUser } from "../services/api"; // Alterado para getCurrentUser
import { useAuth } from "../contexts/AuthContext";

const GoogleCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        console.log("[FRONTEND] Token recebido na URL:", token); // Log para verificar o token recebido

        if (!token) {
          setError("Token não encontrado");
          return;
        }

        localStorage.setItem("token", token); // Armazena o token no localStorage
        const currentUser = await getCurrentUser();

        if (currentUser) {
          login(token, currentUser);
          navigate("/");
        } else {
          setError("Erro ao obter dados do usuário");
        }
      } catch (err) {
        console.error("Erro no callback do Google:", err);
        setError("Erro ao autenticar com Google");
      }
    };

    processAuth();
  }, [login, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#f7f7f8",
        }}
      >
        {error ? (
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        ) : (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Processando autenticação do Google...
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default GoogleCallback;
