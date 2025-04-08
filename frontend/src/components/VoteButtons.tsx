// frontend/src/components/VoteButtons.tsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { IconButton, Typography, Box, Tooltip } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { voteComment, votePost } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { VoteType } from "../models";

interface VoteButtonsProps {
  targetId: string;
  type: "post" | "comment";
  initialScore: number;
  initialVote?: VoteType;
  onVoteUpdate?: (newScore: number, newVote: VoteType) => void;
  postId?: string;
}

export default function VoteButtons({
  targetId,
  type,
  initialScore,
  initialVote,
  onVoteUpdate,
  postId,
}: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<VoteType>(initialVote || null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Sincroniza com props externas
  useEffect(() => {
    setScore(initialScore);
    setUserVote(initialVote || null);
  }, [initialScore, initialVote]);

  const calculateNewScore = useCallback(
    (
      currentScore: number,
      currentVote: VoteType,
      newVote: VoteType
    ): number => {
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
    async (voteType: VoteType) => {
      if (!user) {
        showNotification("Você precisa estar logado para votar", "warning");
        return;
      }

      if (isLoading) return;
      setIsLoading(true);

      const previousVote = userVote;
      const newVote = userVote === voteType ? null : voteType;

      try {
        // Atualização otimista
        const optimisticScore = calculateNewScore(score, previousVote, newVote);
        setUserVote(newVote);
        setScore(optimisticScore);

        // Chamada à API
        let response;
        if (type === "post") {
          response = await votePost(targetId, newVote);
        } else {
          // Verificar se temos o postId necessário
          const effectivePostId =
            postId || window.location.pathname.split("/")[2];
          if (!effectivePostId) {
            throw new Error(
              "Não foi possível determinar o post associado ao comentário"
            );
          }
          response = await voteComment(effectivePostId, targetId, newVote);
        }

        // Atualiza com os dados reais da API
        setScore(response.newScore);
        setUserVote(response.userVote);

        // Notifica o componente pai se necessário
        if (onVoteUpdate) {
          onVoteUpdate(response.newScore, response.userVote);
        }
      } catch (error) {
        // Reverte em caso de erro
        setUserVote(previousVote);
        setScore(initialScore);

        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data.message || "Erro ao atualizar voto"
          : "Erro inesperado ao atualizar voto";

        showNotification(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      user,
      userVote,
      score,
      targetId,
      type,
      calculateNewScore,
      onVoteUpdate,
      initialScore,
      isLoading,
      showNotification,
      postId,
    ]
  );

  const upvoteAriaLabel = useMemo(() => {
    return user ? `Votar positivamente` : "Faça login para votar";
  }, [user]);

  const downvoteAriaLabel = useMemo(() => {
    return user ? `Votar negativamente` : "Faça login para votar";
  }, [user]);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Tooltip title={!user ? "Faça login para votar" : ""}>
        <span>
          <IconButton
            color={userVote === "upvote" ? "primary" : "default"}
            onClick={() => handleVote("upvote")}
            disabled={!user || isLoading}
            aria-label={upvoteAriaLabel}
          >
            <ArrowUpward />
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" fontWeight={500} aria-live="polite">
        {score}
      </Typography>

      <Tooltip title={!user ? "Faça login para votar" : ""}>
        <span>
          <IconButton
            color={userVote === "downvote" ? "error" : "default"}
            onClick={() => handleVote("downvote")}
            disabled={!user || isLoading}
            aria-label={downvoteAriaLabel}
          >
            <ArrowDownward />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
