import React from "react";
import { Typography, Box, Divider, Button } from "@mui/material";
import { User } from "../../models";
import { useAuth } from "../../contexts/AuthContext";
import FriendshipManager from "../FriendshipManager";
import { useNavigate } from "react-router-dom";

interface ProfileDetailsProps {
  user: User;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;
  const navigate = useNavigate();

  return (
    <Box>
      <Button variant="outlined" onClick={() => navigate("/")} sx={{ mb: 2 }}>
        Voltar para o Dashboard
      </Button>

      <Typography variant="body1">
        <strong>Descrição:</strong> {user.bio || "Nenhuma descrição fornecida."}
      </Typography>
      <Typography variant="body1">
        <strong>Localização:</strong> {user.location || "Não especificada."}
      </Typography>
      <Typography variant="body1">
        <strong>Conta criada em:</strong>{" "}
        {new Date(user.createdAt).toLocaleDateString()}
      </Typography>

      {!isOwnProfile && currentUser && (
        <>
          <Divider sx={{ my: 2 }} />
          <FriendshipManager otherUserId={user.id} />
        </>
      )}
    </Box>
  );
};

export default ProfileDetails;
