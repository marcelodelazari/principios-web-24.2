import { memo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

const CommentForm = memo(({ onSubmit }: CommentFormProps) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onSubmit(commentText);
    setCommentText("");
  };

  return (
    <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Escreva seu comentário"
            variant="outlined"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 500 }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {commentText.length}/500 caracteres
            </Typography>
            <Button
              type="submit"
              variant="contained"
              size="medium"
              sx={{ textTransform: "none" }}
            >
              Publicar comentário
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default CommentForm;
