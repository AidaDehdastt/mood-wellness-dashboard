import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(email, password);
      loginUser(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Kunde inte skapa konto. Kontrollera att lösenordet är minst 8 tecken.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" mb={2}>Skapa konto</Typography>
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
        Registrera
      </Button>
      <Typography mt={2}>
        Har du redan ett konto? <Link to="/login">Logga in</Link>
      </Typography>
    </Box>
  );
}