import React from "react";
import { Box } from "@mui/material";
import { useChat } from "../contexts/ChatContext";
import { ChatWindow } from "./ChatWindow";

export const ChatWindows = () => {
  const {
    activeChats,
    closeChat,
    onlineFriends,
    offlineFriends,
    unreadCounts,
  } = useChat();

  const getFriendName = (friendId: number) => {
    const friend = [...onlineFriends, ...offlineFriends].find(
      (f) => f.id === friendId
    );
    return friend?.name || "Usuário";
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        right: 0,
        display: "flex",
        gap: 2,
        padding: 2,
        pointerEvents: "none",
      }}
    >
      {activeChats.map((chat, index) => (
        <Box
          key={chat.friendId}
          sx={{
            pointerEvents: "auto",
            transform: `translateX(${
              index * (chat.isMinimized ? -100 : -320)
            }px)`,
            transition: "transform 0.3s ease",
          }}
        >
          <ChatWindow
            friendId={chat.friendId}
            friendName={getFriendName(chat.friendId)}
            onClose={() => closeChat(chat.friendId)}
            isLoading={chat.isLoading}
            unreadCount={
              chat.isMinimized ? unreadCounts[chat.friendId] || 0 : 0
            }
          />
        </Box>
      ))}
    </Box>
  );
};
