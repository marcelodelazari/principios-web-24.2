import React, { useState, useEffect } from "react";
import { Button, Stack, Typography, Box, Chip } from "@mui/material";
import { PersonAdd, Check, Close, Cancel } from "@mui/icons-material";
import { FriendshipStatus } from "../models";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriendshipStatus,
} from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";

interface FriendshipManagerProps {
  otherUserId: number;
  onStatusChange?: () => void;
  isReceivedRequest?: boolean; // Nova prop para identificar se é uma solicitação recebida
}

const FriendshipManager: React.FC<FriendshipManagerProps> = ({
  otherUserId,
  onStatusChange,
  isReceivedRequest = false, // false por padrão
}) => {
  const [status, setStatus] = useState<FriendshipStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadFriendshipStatus();
  }, [otherUserId]);

  const loadFriendshipStatus = async () => {
    try {
      const currentStatus = await getFriendshipStatus(otherUserId);
      setStatus(currentStatus);
    } catch (error) {
      console.error("Erro ao carregar status da amizade:", error);
    }
  };

  const handleAction = async (action: () => Promise<any>) => {
    setLoading(true);
    try {
      await action();
      await loadFriendshipStatus();
      if (onStatusChange) onStatusChange();
      showNotification("Ação realizada com sucesso!", "success");
    } catch (error: any) {
      showNotification(error.message || "Erro ao realizar ação", "error");
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyStatus = () => {
    switch (status) {
      case FriendshipStatus.pending:
        return "Solicitação Pendente";
      case FriendshipStatus.accepted:
        return "Amigos";
      case FriendshipStatus.blocked:
        return "Usuário Bloqueado";
      case FriendshipStatus.declined:
        return "Solicitação Recusada";
      default:
        return null;
    }
  };

  const renderActionButton = () => {
    if (!currentUser) return null;

    switch (status) {
      case null:
        return (
          <Button
            startIcon={<PersonAdd />}
            variant="contained"
            color="primary"
            disabled={loading}
            onClick={() => handleAction(() => sendFriendRequest(otherUserId))}
          >
            Adicionar Amigo
          </Button>
        );

      case FriendshipStatus.pending:
        if (isReceivedRequest) {
          // Se for uma solicitação recebida, mostra os botões de aceitar/recusar
          return (
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<Check />}
                variant="contained"
                color="success"
                disabled={loading}
                onClick={() =>
                  handleAction(() => acceptFriendRequest(otherUserId))
                }
              >
                Aceitar
              </Button>
              <Button
                startIcon={<Close />}
                variant="outlined"
                color="error"
                disabled={loading}
                onClick={() =>
                  handleAction(() => rejectFriendRequest(otherUserId))
                }
              >
                Recusar
              </Button>
            </Stack>
          );
        } else {
          // Se for uma solicitação enviada, mostra o botão de cancelar
          return (
            <Button
              startIcon={<Cancel />}
              variant="outlined"
              color="error"
              disabled={loading}
              onClick={() =>
                handleAction(() => cancelFriendRequest(otherUserId))
              }
            >
              Cancelar Solicitação
            </Button>
          );
        }

      case FriendshipStatus.accepted:
        return (
          <Button
            startIcon={<Cancel />}
            variant="outlined"
            color="error"
            disabled={loading}
            onClick={() => handleAction(() => cancelFriendRequest(otherUserId))}
          >
            Desfazer Amizade
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {status && (
        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
          Status de amizade: <Chip label={getFriendlyStatus()} size="small" />
        </Typography>
      )}
      {renderActionButton()}
    </Box>
  );
};

export default FriendshipManager;
