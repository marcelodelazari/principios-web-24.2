import React, { useState } from "react";
import { Box, Avatar, Button, CircularProgress } from "@mui/material";

interface ProfilePictureProps {
  imageUrl: string;
  onUpload: (file: File) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  imageUrl,
  onUpload,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      await onUpload(file);
      setUploading(false);
    }
  };

  return (
    <Box>
      <Avatar
        src={imageUrl}
        alt="Profile"
        sx={{ width: 120, height: 120, margin: "0 auto" }}
      />
      <Button
        variant="outlined"
        component="label"
        sx={{ mt: 2 }}
        disabled={uploading}
      >
        {uploading ? <CircularProgress size={24} /> : "Alterar Foto"}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );
};

export default ProfilePicture;
