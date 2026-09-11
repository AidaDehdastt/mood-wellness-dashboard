import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      loginUser(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Fel e-post eller lösenord.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" mb={2}>Logga in</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="E-post" fullWidth margin="normal" value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Lösenord" type="password" fullWidth margin="normal" value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Logga in
      </Button>
      <Typography mt={2}>
        Inget konto? <Link to="/register">Registrera dig</Link>
      </Typography>
    </Box>
  );
}