import React, { useState } from "react";
import { User } from "../../models";
import { updateProfile } from "../../services/api";
import { Box, TextField, Button } from "@mui/material";

interface ProfileEditProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    location: user.location || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile(user.id, formData);
      onUpdate(updatedUser); // Atualiza o estado no componente pai
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Nome"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Biografia"
        multiline
        rows={3}
        value={formData.bio}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, bio: e.target.value }))
        }
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Localização"
        value={formData.location}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, location: e.target.value }))
        }
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button type="submit" variant="contained">
          Salvar
        </Button>
        <Button
          variant="outlined"
          onClick={() => onUpdate(user)} // Cancela a edição sem alterar os dados
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileEdit;
