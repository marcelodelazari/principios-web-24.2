import { useEffect, useState, ReactElement } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import VoteButtons from "../components/VoteButtons";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function PostDetails(): ReactElement {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const theme = useTheme();

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

      const completeComment = {
        ...response.data,
        authorName: user.name,
        content: newComment,
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: "text.primary" }}
      >
        Voltar para o Dashboard
      </Button>

      {/* Post Principal */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <VoteButtons
              postId={post.id}
              initialScore={post.score}
              initialVote={post.userVote}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 600, mb: 2 }}
              >
                {post.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                  mb: 3,
                  fontFamily: "inherit",
                }}
              >
                {post.content}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ color: "text.secondary", mt: 2 }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "0.8rem",
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {post.authorName}
                </Avatar>
                <Typography variant="body2">
                  Postado por {post.authorName}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Seção de Comentários */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Comentários ({comments.length})
        </Typography>

        {user && (
          <Card sx={{ mb: 4, bgcolor: "background.paper" }}>
            <CardContent>
              <Box
                component="form"
                onSubmit={handleCommentSubmit}
                sx={{ mb: 2 }}
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Escreva seu comentário"
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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
                    {newComment.length}/500 caracteres
                  </Typography>
                  <Button type="submit" variant="contained" size="medium">
                    Publicar comentário
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {comments.map((comment) => (
          <Card
            key={comment.id}
            sx={{
              mb: 2,
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-line", lineHeight: 1.6, mb: 1.5 }}
              >
                {comment.content}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ color: "text.secondary" }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: "0.8rem",
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  {comment.authorName}
                </Avatar>
                <Typography variant="caption">
                  {comment.authorName}
                </Typography>
                <Divider orientation="vertical" flexItem />
                <Typography variant="caption">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}