import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <nav>
        <Link to="/">Home</Link>
        {user && (
          <div className="profile-link">
            <Link to="/profile">{user.name}</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
