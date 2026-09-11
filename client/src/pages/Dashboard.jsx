import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter,
} from "recharts";
import { getDailyLogs } from "../api/dailyLogs";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDailyLogs().then((res) => setLogs(res.data));
  }, []);

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("sv-SE"),
    Humör: l.moodScore,
    Sömn: l.sleepHours,
  }));

  const scatterData = logs.map((l) => ({ x: l.sleepHours, y: l.moodScore }));

  const avgMood = logs.length ? (logs.reduce((s, l) => s + l.moodScore, 0) / logs.length).toFixed(1) : "-";
  const avgSleep = logs.length ? (logs.reduce((s, l) => s + l.sleepHours, 0) / logs.length).toFixed(1) : "-";

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Box>
          <Button onClick={() => navigate("/log")} variant="contained" sx={{ mr: 2 }}>
            Logga idag
          </Button>
          <Button onClick={logoutUser} variant="outlined">Logga ut</Button>
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{avgMood}</Typography>
            <Typography variant="body2">Snitt humör</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{avgSleep}h</Typography>
            <Typography variant="body2">Snitt sömn</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" mb={1}>Humör & sömn över tid</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="Humör" stroke="#8884d8" />
          <Line type="monotone" dataKey="Sömn" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <Typography variant="h6" mt={4} mb={1}>Samband: sömn vs humör</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis dataKey="x" name="Sömntimmar" />
          <YAxis dataKey="y" name="Humör" />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={scatterData} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
}