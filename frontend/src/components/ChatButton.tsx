import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useChat } from "../contexts/ChatContext";
import UserAvatar from "./UserAvatar";

export const ChatButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { onlineFriends, offlineFriends, openChat, unreadCounts, activeChats } =
    useChat();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getTotalUnreadCount = () => {
    return Object.entries(unreadCounts).reduce((acc, [friendId, count]) => {
      const chat = activeChats.find((c) => c.friendId === parseInt(friendId));
      if (!chat || chat.isMinimized) {
        return acc + count;
      }
      return acc;
    }, 0);
  };

  // Combinar e ordenar amigos: online primeiro, depois ordenar por nome
  const allFriends = [...onlineFriends, ...offlineFriends].sort((a, b) => {
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={getTotalUnreadCount()} color="error">
          <ChatIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 500 },
        }}
      >
        <Typography variant="subtitle1" sx={{ p: 2 }}>
          Amigos ({allFriends.length})
        </Typography>

        {allFriends.map((friend) => (
          <MenuItem
            key={friend.id}
            onClick={() => {
              openChat(friend.id);
              handleClose();
            }}
            sx={{
              opacity: friend.isOnline ? 1 : 0.6,
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 1,
              },
            }}
          >
            <ListItemAvatar>
              <Box sx={{ position: "relative" }}>
                <UserAvatar
                  name={friend.name}
                  avatarUrl={friend.avatarUrl || undefined}
                />
                {friend.isOnline ? (
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "success.main",
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                    }}
                  />
                ) : (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      fontSize: "0.6rem",
                      bgcolor: "grey.400",
                      color: "white",
                      borderRadius: "4px",
                      px: 0.5,
                      py: 0.1,
                    }}
                  >
                    offline
                  </Typography>
                )}
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={friend.name}
              sx={{
                "& .MuiTypography-root": {
                  color: friend.isOnline ? "text.primary" : "text.secondary",
                },
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
