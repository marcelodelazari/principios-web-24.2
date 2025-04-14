import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Fade,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import MinimizeIcon from "@mui/icons-material/Remove";
import MaximizeIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { useChat } from "../contexts/ChatContext";

interface ChatWindowProps {
  friendId: number;
  friendName: string;
  onClose: () => void;
  isLoading?: boolean;
  unreadCount?: number;
}

export const ChatWindow = ({
  friendId,
  friendName,
  onClose,
  isLoading = false,
  unreadCount = 0,
}: ChatWindowProps) => {
  const { sendMessage, activeChats, minimizeChat, maximizeChat } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const chat = activeChats.find((chat) => chat.friendId === friendId);
  const isMinimized = chat?.isMinimized;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isMinimized && !isLoading) {
      scrollToBottom();
    }
  }, [chat?.messages, isMinimized, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setNewMessage("");
      try {
        await sendMessage(friendId, newMessage.trim());
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  return (
    <Paper
      sx={{
        width: 300,
        height: isMinimized ? "auto" : 400,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header - Sempre visível */}
      <Box
        sx={{
          p: 1,
          bgcolor:
            isMinimized && unreadCount > 0 ? "secondary.main" : "primary.main",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            cursor: "pointer",
            flex: 1,
            "&:hover": { opacity: 0.8 },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          onClick={() =>
            isMinimized ? maximizeChat(friendId) : minimizeChat(friendId)
          }
        >
          {friendName}
          {isMinimized && unreadCount > 0 && (
            <Box
              sx={{
                bgcolor: "error.main",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            color="inherit"
            onClick={() =>
              isMinimized ? maximizeChat(friendId) : minimizeChat(friendId)
            }
          >
            {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
          </IconButton>
          <IconButton size="small" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Conteúdo - Visível apenas quando não minimizado */}
      <Fade in={!isMinimized}>
        <Box
          sx={{
            display: isMinimized ? "none" : "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {chat?.messages.map((message) => (
                  <ListItem
                    key={message.id || message.tempId}
                    sx={{
                      justifyContent:
                        message.senderId === friendId
                          ? "flex-start"
                          : "flex-end",
                      py: 0.5,
                    }}
                  >
                    <Box sx={{ maxWidth: "70%", position: "relative" }}>
                      <ListItemText
                        primary={message.content}
                        sx={{
                          bgcolor:
                            message.senderId === friendId
                              ? "grey.300"
                              : message.status === "sending"
                              ? "primary.200"
                              : message.status === "error"
                              ? "error.light"
                              : "primary.main",
                          color:
                            message.senderId === friendId
                              ? "text.primary"
                              : "white",
                          p: 1,
                          borderRadius: 1,
                          opacity: message.status === "sending" ? 0.7 : 1,
                        }}
                      />
                      {message.status === "sending" && (
                        <CircularProgress
                          size={12}
                          sx={{
                            position: "absolute",
                            right: -20,
                            bottom: 10,
                          }}
                        />
                      )}
                      {message.status === "error" && (
                        <ErrorOutlineIcon
                          color="error"
                          sx={{
                            position: "absolute",
                            right: -20,
                            bottom: 10,
                            fontSize: 16,
                          }}
                        />
                      )}
                    </Box>
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>

              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 1,
                  display: "flex",
                  gap: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <TextField
                  size="small"
                  fullWidth
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <IconButton type="submit" color="primary">
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Paper>
  );
};
