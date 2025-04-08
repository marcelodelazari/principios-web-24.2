import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Snackbar,
} from "@mui/material";
import ProfileDetails from "../../components/Profile/ProfileDetails";
import ProfileEdit from "../../components/Profile/ProfileEdit";
import ProfilePicture from "../../components/Profile/ProfilePicture";
import {
  getCurrentUser,
  getUserProfile,
  uploadAvatar,
} from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../models";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: loggedInUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const profileData = userId
        ? await getUserProfile(parseInt(userId))
        : await getCurrentUser();
      setUser(profileData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId]); // Atualiza os dados sempre que o userId mudar

  const handleAvatarUpload = async (file: File) => {
    try {
      const updatedUser = await uploadAvatar(user!.id, file);
      setUser(updatedUser); // Atualiza o estado do usuário com os dados retornados
      setSnackbarOpen(true); // Exibe feedback ao usuário
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (!user) {
    return <Typography>Usuário não encontrado</Typography>;
  }

  const isOwnProfile = loggedInUser?.id === user.id;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        mt: 4,
        px: 2,
      }}
    >
      {/* Foto do Perfil */}
      <Box
        sx={{
          flex: { xs: "1 1 auto", md: "0 0 30%" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card sx={{ textAlign: "center", p: 2, width: "100%" }}>
          <ProfilePicture
            imageUrl={user.avatarUrl || "/default-avatar.png"}
            onUpload={handleAvatarUpload}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {user.name}
          </Typography>
        </Card>
      </Box>

      {/* Informações do Perfil */}
      <Box
        sx={{
          flex: "1 1 auto",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Informações do Perfil
            </Typography>
            {isEditing ? (
              <ProfileEdit user={user} onUpdate={handleUpdateUser} />
            ) : (
              <ProfileDetails user={user} />
            )}
            {isOwnProfile && !isEditing && (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </Button>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Avatar atualizado com sucesso!"
      />
    </Box>
  );
};

export default ProfilePage;
