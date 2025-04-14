import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { colors } from "../theme/colors";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import UserAvatar from "./UserAvatar"; // Importa o componente reutilizável
import { ChatButton } from "./ChatButton";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
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
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ChatButton />
                {/* ... outros botões ... */}
              </Box>
              <IconButton
                component={Link}
                to={`/profile/${user.id}`} // Redireciona para o perfil do usuário logado
                sx={{
                  p: 0,
                  "&:hover": {
                    bgcolor: colors.primary.light,
                  },
                }}
              >
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl || undefined} // Verifica se avatarUrl existe
                  size={36} // Ajusta o tamanho do avatar
                />
              </IconButton>
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
            </>
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
  );
}
