import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);

      if (response && response.token && response.user) {
        login(response.token, response.user);

        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Atualize o contexto com os dados completos (incluindo isAdmin)
          login(response.token, currentUser);
        }

        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError("Resposta inválida do servidor");
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.message || "Erro desconhecido");
      } else {
        setError("Não foi possível conectar ao servidor");
      }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          textAlign: "center",
          padding: 4,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          backgroundColor: "#f7f7f8",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#2d2d2d",
            mb: 4,
          }}
        >
          Login
        </Typography>

        {/* Botão de Login Google */}
        <GoogleLoginButton />

        <Box sx={{ position: "relative", my: 3 }}>
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" sx={{ px: 1, color: "text.secondary" }}>
              ou
            </Typography>
          </Divider>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Digite seu email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#666" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#404040" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Digite sua senha"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#666" },
                "&:hover fieldset": { borderColor: "#888" },
                "&.Mui-focused fieldset": { borderColor: "#404040" },
              },
            }}
          />

          {error && (
            <Typography
              color="error"
              sx={{
                mt: 2,
                backgroundColor: "#ffecec",
                padding: 1,
                borderRadius: 1,
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: "#404040",
              textTransform: "none",
              fontSize: "1rem",
              py: 1.5,
              "&:hover": { backgroundColor: "#505050" },
            }}
          >
            Entrar
          </Button>

          <Button
            component={Link}
            to="/"
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              borderColor: "#666",
              color: "#2d2d2d",
              textTransform: "none",
              "&:hover": {
                borderColor: "#888",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Voltar para o Dashboard
          </Button>

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="body2" color="textSecondary">
              Novo por aqui?
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="text"
              sx={{
                textTransform: "none",
                color: "#404040",
                fontWeight: 500,
                p: 0,
                minWidth: "auto",
                "&:hover": { backgroundColor: "transparent" },
              }}
            >
              Crie sua conta
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
