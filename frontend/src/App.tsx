// frontend/src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";
import { colors } from "./theme/colors";

import { AuthProvider } from "./contexts/AuthContext";
import { PostProvider } from "./contexts/PostContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostDetails from "./pages/PostDetails";
import CreatePost from "./pages/CreatePost";
import ProtectedRoute from "./components/ProtectedRoute";

// Criação do tema personalizado
const theme = createTheme(
  {
    palette: {
      primary: {
        main: colors.primary.main,
        dark: colors.primary.dark,
        light: colors.primary.light,
      },
      secondary: {
        main: colors.secondary.main,
        dark: colors.secondary.dark,
        light: colors.secondary.light,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      error: {
        main: colors.status.error,
      },
      warning: {
        main: colors.status.warning,
      },
      success: {
        main: colors.status.success,
      },
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
  },
  ptBR
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <NotificationProvider>
          <PostProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/posts/:postId" element={<PostDetails />} />
                <Route
                  path="/create-post"
                  element={
                    <ProtectedRoute>
                      <CreatePost />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </PostProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
