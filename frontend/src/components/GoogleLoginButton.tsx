import { Button, Box, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

interface GoogleLoginButtonProps {
  onClick?: () => void;
}

const GoogleLoginButton = ({ onClick }: GoogleLoginButtonProps) => {
  const handleGoogleLogin = () => {
    const url = `${
      process.env.REACT_APP_BACKEND_URL || "http://localhost:3000"
    }/google`;
    console.log("Redirecionando para:", url); // Log da URL
    window.location.href = url;
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick || handleGoogleLogin}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        color: "#757575",
        border: "1px solid #dadce0",
        borderRadius: 1,
        padding: "10px 0",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#f1f3f4",
          borderColor: "#dadce0",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <GoogleIcon
          sx={{
            color: "#4285F4",
          }}
        />
        <Typography variant="body1">Continuar com Google</Typography>
      </Box>
    </Button>
  );
};

export default GoogleLoginButton;
