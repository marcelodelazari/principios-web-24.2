import React from "react";
import { Typography, Box } from "@mui/material";
import { User } from "../../models";

interface ProfileDetailsProps {
  user: User;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user }) => {
  return (
    <Box>
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
    </Box>
  );
};

export default ProfileDetails;
