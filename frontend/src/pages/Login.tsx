import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api"; // Alterado aqui
import { useAuth } from "../contexts/AuthContext";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);

      // A resposta já vem como data direto do service
      if (response && response.token && response.user) {
        // Remova .data
        login(response.token, response.user);
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
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Digite seu email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label="Digite sua senha"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>

          <Button
            component={Link}
            to="/"
            fullWidth
            variant="outlined"
            sx={{ mt: 1, mb: 2 }}
          >
            Voltar para o Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
