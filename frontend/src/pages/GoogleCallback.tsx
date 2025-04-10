import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography, Container } from "@mui/material";
import { processGoogleLogin } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const GoogleCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Pegar o código da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          setError("Código de autorização não encontrado");
          return;
        }

        // Processar o login com o código
        const response = await processGoogleLogin(code);

        if (response?.token && response?.user) {
          login(response.token, response.user);
          navigate("/");
        } else {
          setError("Erro ao processar login com Google");
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
