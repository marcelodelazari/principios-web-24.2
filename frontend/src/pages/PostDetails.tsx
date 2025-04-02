import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import VoteButtons from "../components/VoteButtons";

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  score: number;
  userVote?: "upvote" | "downvote" | null;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  authorName: string;
}

export default function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postResponse, commentsResponse] = await Promise.all([
          axios.get(`/posts/${postId}`),
          axios.get(`/posts/${postId}/comments`),
        ]);

        setPost(postResponse.data);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const response = await axios.post(
        `/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Ajuste para usar os dados completos da resposta
      const completeComment = {
        ...response.data,
        authorName: user.name,
        content: newComment, // Garante o conteúdo imediato
        createdAt: new Date().toISOString(),
      };

      setComments([completeComment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  if (loading) return <Typography>Carregando...</Typography>;
  if (!post) return <Typography>Post não encontrado</Typography>;

  return (
    <Container maxWidth="md">
      <Button component={Link} to="/" sx={{ mb: 2 }}>
        Voltar para o Dashboard
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <VoteButtons
            postId={post.id}
            initialScore={post.score}
            initialVote={post.userVote}
          />
          <Typography variant="h4" gutterBottom>
            {post.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {post.content}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Postado por {post.authorName} em{" "}
            {new Date(post.createdAt).toLocaleDateString("pt-BR")}
          </Typography>
        </CardContent>
      </Card>

      {user && (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Adicionar comentário"
            variant="outlined"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Comentar
          </Button>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Comentários ({comments.length})
      </Typography>

      {comments.map((comment) => (
        <Card key={comment.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="body1" paragraph>
              {comment.content || "Comentário carregando..."}{" "}
              {/* Fallback seguro */}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Comentado por {comment.authorName || "Autor desconhecido"} em{" "}
              {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}
