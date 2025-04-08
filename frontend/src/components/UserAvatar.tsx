import React from "react";
import { Avatar } from "@mui/material";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number; // Permite ajustar o tamanho do avatar
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 40,
}) => {
  return (
    <Avatar
      src={avatarUrl || undefined}
      alt={name}
      sx={{
        width: size,
        height: size,
        fontSize: size / 2.5,
        bgcolor: avatarUrl ? "transparent" : "#757575", // Cor de fundo para avatar genérico
        color: "#fff",
      }}
    >
      {!avatarUrl && name[0].toUpperCase()}{" "}
      {/* Mostra a inicial do nome se não houver foto */}
    </Avatar>
  );
};

export default UserAvatar;
