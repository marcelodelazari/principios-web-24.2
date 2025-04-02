import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { getPosts } from "../services/api";

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Container>
      <div
        style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}
      >
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="primary"
        >
          Login
        </Button>
      </div>

      <h1>Latest Posts</h1>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id} style={{ marginBottom: "1rem" }}>
            <CardContent>
              <Typography variant="h5">{post.title}</Typography>
              <Typography variant="body1">{post.content}</Typography>
              <Typography variant="caption">
                Posted by User #{post.authorId} on{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}
