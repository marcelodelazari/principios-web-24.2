import React, { createContext, useContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import {
  getFriendsWithStatus,
  getConversation,
  sendMessage as apiSendMessage,
} from "../services/api";
import { Friendship, Message } from "../models";

interface ChatContextData {
  openChat: (friendId: number) => void;
  closeChat: (friendId: number) => void;
  sendMessage: (friendId: number, content: string) => Promise<void>;
  minimizeChat: (friendId: number) => void;
  maximizeChat: (friendId: number) => void;
  activeChats: ChatWindow[];
  socket: Socket | null;
  onlineFriends: Friend[];
  offlineFriends: Friend[];
  unreadCounts: Record<number, number>;
}

interface Friend {
  id: number;
  name: string;
  avatarUrl: string | null | undefined; // Permitir null ou undefined
  isOnline: boolean;
}

interface ChatWindow {
  friendId: number;
  messages: Message[];
  isMinimized?: boolean;
  isLoading?: boolean; // Adicionar esta propriedade
}

const ChatContext = createContext<ChatContextData>({} as ChatContextData);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChats, setActiveChats] = useState<ChatWindow[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [offlineFriends, setOfflineFriends] = useState<Friend[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const { token, user } = useAuth();

  useEffect(() => {
    const loadFriends = async () => {
      if (!token || !user) return;

      try {
        const friends = await getFriendsWithStatus();
        setOnlineFriends(
          friends
            .filter((f) => f.isOnline)
            .map((f) => ({
              id: f.otherUser.id,
              name: f.otherUser.name,
              avatarUrl: f.otherUser.avatarUrl || null,
              isOnline: true,
            }))
        );

        setOfflineFriends(
          friends
            .filter((f) => !f.isOnline)
            .map((f) => ({
              id: f.otherUser.id,
              name: f.otherUser.name,
              avatarUrl: f.otherUser.avatarUrl || null,
              isOnline: false,
            }))
        );
      } catch (error) {
        console.error("Erro ao carregar amigos:", error);
      }
    };

    loadFriends();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    const newSocket = io(
      process.env.REACT_APP_BACKEND_URL || "http://localhost:3000",
      {
        auth: { token },
      }
    );

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      setSocket(newSocket);
    });

    newSocket.on("new_message", (message: Message) => {
      handleNewMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  useEffect(() => {
    if (socket) {
      socket.on("friend_online", (friendId: number) => {
        updateFriendStatus(friendId, true);
      });

      socket.on("friend_offline", (friendId: number) => {
        updateFriendStatus(friendId, false);
      });
    }
  }, [socket]);

  const updateFriendStatus = (friendId: number, isOnline: boolean) => {
    if (isOnline) {
      const friend = offlineFriends.find((f) => f.id === friendId);
      if (friend) {
        setOfflineFriends((prev) => prev.filter((f) => f.id !== friendId));
        setOnlineFriends((prev) => [...prev, { ...friend, isOnline: true }]);
      }
    } else {
      const friend = onlineFriends.find((f) => f.id === friendId);
      if (friend) {
        setOnlineFriends((prev) => prev.filter((f) => f.id !== friendId));
        setOfflineFriends((prev) => [...prev, { ...friend, isOnline: false }]);
      }
    }
  };

  const handleNewMessage = (message: Message) => {
    setActiveChats((prev) =>
      prev.map((chat) => {
        if (
          chat.friendId === message.senderId ||
          chat.friendId === message.receiverId
        ) {
          return {
            ...chat,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      })
    );

    // Atualizar contagem de não lidas apenas se o chat estiver minimizado ou fechado
    const activeChat = activeChats.find(
      (chat) => chat.friendId === message.senderId
    );
    if (!activeChat || (activeChat && activeChat.isMinimized)) {
      setUnreadCounts((prev) => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1,
      }));
    }
  };

  const openChat = async (friendId: number) => {
    // Se o chat já estiver aberto, não faz nada
    if (activeChats.some((chat) => chat.friendId === friendId)) {
      return;
    }

    // Adicionar chat com estado de carregamento
    setActiveChats((prev) => [
      ...prev,
      {
        friendId,
        messages: [],
        isLoading: true,
      },
    ]);

    try {
      // Carregar histórico de mensagens
      const messages = await getConversation(friendId);

      // Atualizar chat com mensagens e remover estado de carregamento
      setActiveChats((prev) =>
        prev.map((chat) =>
          chat.friendId === friendId
            ? {
                ...chat,
                messages,
                isLoading: false,
              }
            : chat
        )
      );

      // Limpar contagem de não lidas
      setUnreadCounts((prev) => ({
        ...prev,
        [friendId]: 0,
      }));
    } catch (error) {
      console.error("Error opening chat:", error);
      // Em caso de erro, remover o chat
      closeChat(friendId);
    }
  };

  const closeChat = (friendId: number) => {
    setActiveChats((prev) => prev.filter((chat) => chat.friendId !== friendId));
  };

  const minimizeChat = (friendId: number) => {
    setActiveChats((prev) =>
      prev.map((chat) =>
        chat.friendId === friendId ? { ...chat, isMinimized: true } : chat
      )
    );
  };

  const maximizeChat = (friendId: number) => {
    setActiveChats((prev) =>
      prev.map((chat) =>
        chat.friendId === friendId ? { ...chat, isMinimized: false } : chat
      )
    );
    // Limpar contagem de não lidas quando maximizar
    setUnreadCounts((prev) => ({
      ...prev,
      [friendId]: 0,
    }));
  };

  const sendMessage = async (friendId: number, content: string) => {
    if (!socket || !user) return;

    // Criar ID temporário para a mensagem
    const tempId = `temp-${Date.now()}`;

    // Criar mensagem otimista
    const optimisticMessage: Message = {
      id: -1,
      tempId,
      content,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      receiverId: friendId,
      read: false,
      status: "sending",
      sender: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };

    // Adicionar mensagem otimista ao chat
    setActiveChats((prev) =>
      prev.map((chat) =>
        chat.friendId === friendId
          ? {
              ...chat,
              messages: [...chat.messages, optimisticMessage],
            }
          : chat
      )
    );

    try {
      // Enviar mensagem para o servidor
      const confirmedMessage = await apiSendMessage(friendId, content);

      // Atualizar mensagem com dados do servidor
      setActiveChats((prev) =>
        prev.map((chat) =>
          chat.friendId === friendId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.tempId === tempId
                    ? { ...confirmedMessage, status: "sent" }
                    : msg
                ),
              }
            : chat
        )
      );
    } catch (error) {
      // Marcar mensagem como erro
      setActiveChats((prev) =>
        prev.map((chat) =>
          chat.friendId === friendId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.tempId === tempId ? { ...msg, status: "error" } : msg
                ),
              }
            : chat
        )
      );
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        openChat,
        closeChat,
        sendMessage,
        minimizeChat,
        maximizeChat,
        activeChats,
        socket,
        onlineFriends,
        offlineFriends,
        unreadCounts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
