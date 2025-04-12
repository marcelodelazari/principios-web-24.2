import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
} from "@mui/material";
import { getFriends, getPendingRequests } from "../../services/api";
import { Friendship } from "../../models";
import UserAvatar from "../UserAvatar";
import { Link } from "react-router-dom";
import FriendshipManager from "../FriendshipManager";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const FriendsList: React.FC = () => {
  const [value, setValue] = useState(0);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);

  const loadFriends = async () => {
    try {
      const friendsData = await getFriends();
      setFriends(friendsData || []); // Garante que a lista seja um array vazio se não houver amigos
    } catch (error) {
      console.error("Erro ao carregar amigos:", error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const requests = await getPendingRequests();
      setPendingRequests(requests || []); // Garante que a lista seja um array vazio se não houver solicitações
    } catch (error) {
      console.error("Erro ao carregar solicitações pendentes:", error);
    }
  };

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleStatusChange = () => {
    loadFriends();
    loadPendingRequests();
  };

  const renderFriendItem = (friendship: Friendship) => {
    const otherUser = friendship.otherUser;

    if (!otherUser) {
      return null; // Ignora amizades sem `otherUser`
    }

    return (
      <ListItem key={friendship.id}>
        <ListItemAvatar>
          <UserAvatar
            name={otherUser.name}
            avatarUrl={otherUser.avatarUrl}
            size={40}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Link
              to={`/profile/${otherUser.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {otherUser.name}
            </Link>
          }
          secondary={otherUser.bio || "Sem descrição"}
        />
      </ListItem>
    );
  };

  const renderPendingRequestItem = (request: Friendship) => {
    const otherUser = request.otherUser;

    if (!otherUser) {
      return null;
    }

    return (
      <ListItem key={request.id}>
        <ListItemAvatar>
          <UserAvatar
            name={otherUser.name}
            avatarUrl={otherUser.avatarUrl}
            size={40}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Link
              to={`/profile/${otherUser.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {otherUser.name}
            </Link>
          }
          secondary={otherUser.bio || "Sem descrição"}
        />
        <Box>
          <FriendshipManager
            otherUserId={otherUser.id}
            onStatusChange={handleStatusChange}
            isReceivedRequest={true}
          />
        </Box>
      </ListItem>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange}>
              <Tab label={`Amigos (${friends.length})`} />
              <Tab label={`Solicitações (${pendingRequests.length})`} />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <List>
              {friends.length > 0 ? (
                friends.map(renderFriendItem)
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Nenhum amigo encontrado.
                </Typography>
              )}
            </List>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <List>
              {pendingRequests.length > 0 ? (
                pendingRequests.map(renderPendingRequestItem)
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Nenhuma solicitação pendente.
                </Typography>
              )}
            </List>
          </TabPanel>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FriendsList;
