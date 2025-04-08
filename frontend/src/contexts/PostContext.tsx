// frontend/src/contexts/PostContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Post, Comment, VoteType } from "../models";
import {
  getPosts,
  getPostById,
  createPost as apiCreatePost,
  updatePost as apiUpdatePost,
  deletePost as apiDeletePost,
  votePost as apiVotePost,
} from "../services/api";

interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<Post[]>;
  getPost: (id: string) => Promise<Post | null>;
  createPost: (title: string, content: string) => Promise<Post | null>;
  updatePost: (
    id: string,
    title: string,
    content: string
  ) => Promise<Post | null>;
  deletePost: (id: string) => Promise<boolean>;
  votePost: (
    id: string,
    voteType: VoteType
  ) => Promise<{ newScore: number; userVote: VoteType } | null>;
}

const PostContext = createContext<PostContextType>(null!);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      return fetchedPosts;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar posts";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPost = useCallback(async (id: string): Promise<Post | null> => {
    try {
      return await getPostById(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar post";
      setError(errorMessage);
      return null;
    }
  }, []);

  const createPost = useCallback(
    async (title: string, content: string): Promise<Post | null> => {
      try {
        const newPost = await apiCreatePost(title, content);
        setPosts((currentPosts) => [newPost, ...currentPosts]);
        return newPost;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao criar post";
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const updatePost = useCallback(
    async (
      id: string,
      title: string,
      content: string
    ): Promise<Post | null> => {
      try {
        const updatedPost = await apiUpdatePost(id, title, content);
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === id ? { ...post, title, content } : post
          )
        );
        return updatedPost;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao atualizar post";
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiDeletePost(id);
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar post";
      setError(errorMessage);
      return false;
    }
  }, []);

  const votePost = useCallback(async (id: string, voteType: VoteType) => {
    try {
      const response = await apiVotePost(id, voteType);

      // Atualiza o post localmente após o voto
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === id
            ? { ...post, score: response.newScore, userVote: response.userVote }
            : post
        )
      );

      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao votar no post";
      setError(errorMessage);
      return null;
    }
  }, []);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        getPost,
        createPost,
        updatePost,
        deletePost,
        votePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
