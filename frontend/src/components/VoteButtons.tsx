import { useState, useEffect, useCallback } from "react";
import { IconButton, Typography, Box, Tooltip } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface VoteButtonsProps {
  targetId: string;
  type: "post" | "comment";
  initialScore: number;
  initialVote?: "upvote" | "downvote" | null;
  onVoteUpdate?: (
    newScore: number,
    newVote: "upvote" | "downvote" | null
  ) => void;
}

interface VoteResponse {
  newScore: number;
  userVote: "upvote" | "downvote" | null;
}

export default function VoteButtons({
  targetId,
  type,
  initialScore,
  initialVote,
  onVoteUpdate,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialVote);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Sincroniza com props externas
  // frontend/src/components/VoteButtons.tsx
  useEffect(() => {
    setScore(initialScore);
    setUserVote(initialVote);
  }, [initialScore, initialVote]);

  const calculateNewScore = useCallback(
    (
      currentScore: number,
      currentVote: typeof userVote,
      newVote: typeof userVote
    ) => {
      let change = 0;

      if (currentVote === "upvote" && newVote !== "upvote") change -= 1;
      if (currentVote === "downvote" && newVote !== "downvote") change += 1;
      if (newVote === "upvote" && currentVote !== "upvote") change += 1;
      if (newVote === "downvote" && currentVote !== "downvote") change -= 1;

      return currentScore + change;
    },
    []
  );

  const handleVote = useCallback(
    async (voteType: "upvote" | "downvote" | null) => {
      if (!user) return;

      const previousVote = userVote;
      const newVote = userVote === voteType ? null : voteType;

      try {
        // Atualização otimista
        const optimisticScore = calculateNewScore(score, previousVote, newVote);
        setUserVote(newVote);
        setScore(optimisticScore);
        setError(null);

        // Endpoint dinâmico
        const endpoint =
          type === "post"
            ? `/posts/${targetId}/vote`
            : `/comments/${targetId}/vote`;

        let response;
        if (type === "post") {
          response = await axios.post<VoteResponse>(
            `/posts/${targetId}/vote`,
            { voteType: newVote },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        } else {
          // Para comentários, precisamos do postId também
          const postId = window.location.pathname.split("/")[2]; // Extrai o postId da URL
          response = await axios.post<VoteResponse>(
            `/posts/${postId}/comments/${targetId}/vote`,
            { voteType: newVote },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }

        setScore(response.data.newScore);
        setUserVote(response.data.userVote);

        // Notificar componente pai
        if (onVoteUpdate) {
          onVoteUpdate(response.data.newScore, response.data.userVote);
        }
      } catch (error) {
        // ... mantido o código existente ...
      }
    },
    [user, userVote, score, targetId, type, calculateNewScore, onVoteUpdate]
  );

  const handleUpvote = useCallback(() => handleVote("upvote"), [handleVote]);
  const handleDownvote = useCallback(
    () => handleVote("downvote"),
    [handleVote]
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title={!user ? "Faça login para votar" : ""}>
        <span>
          <IconButton
            color={userVote === "upvote" ? "primary" : "default"}
            onClick={handleUpvote}
            disabled={!user}
            aria-label="Upvote"
          >
            <ArrowUpward />
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" fontWeight={500}>
        {score}
      </Typography>

      <Tooltip title={!user ? "Faça login para votar" : ""}>
        <span>
          <IconButton
            color={userVote === "downvote" ? "error" : "default"}
            onClick={handleDownvote}
            disabled={!user}
            aria-label="Downvote"
          >
            <ArrowDownward />
          </IconButton>
        </span>
      </Tooltip>

      {error && (
        <Typography color="error" variant="caption" display="block">
          {error}
        </Typography>
      )}
    </Box>
  );
}
