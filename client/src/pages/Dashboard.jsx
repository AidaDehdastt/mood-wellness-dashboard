import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Grid, Paper } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter,
} from "recharts";
import { getDailyLogs, deleteDailyLog } from "../api/dailyLogs";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getDailyLogs().then((res) => setLogs(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Vill du ta bort den här loggen?")) return;
    try {
      await deleteDailyLog(id);
      setLogs(logs.filter((l) => l.id !== id));
    } catch {
      alert("Kunde inte ta bort loggen.");
    }
  };

  const chartData = logs.map((l) => ({
    date: new Date(l.date).toLocaleDateString("sv-SE"),
    Humör: l.moodScore,
    Sömn: l.sleepHours,
  }));

  const scatterData = logs.map((l) => ({ x: l.sleepHours, y: l.moodScore }));

  const avgMood = logs.length ? (logs.reduce((s, l) => s + l.moodScore, 0) / logs.length).toFixed(1) : "-";
  const avgSleep = logs.length ? (logs.reduce((s, l) => s + l.sleepHours, 0) / logs.length).toFixed(1) : "-";

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyActivities = logs
    .filter((l) => new Date(l.date) >= oneWeekAgo)
    .flatMap((l) =>
      (l.activityLogs || []).map((al) => ({
        date: new Date(l.date).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" }),
        name: al.activity?.name ?? "Okänd",
        duration: al.durationMinutes,
      }))
    );

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
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{avgMood}</Typography>
            <Typography variant="body2">Snitt humör</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
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

      <Typography variant="h6" mt={4} mb={1}>Aktiviteter senaste 7 dagarna</Typography>
      {weeklyActivities.length === 0 ? (
        <Typography color="text.secondary">Inga loggade aktiviteter denna vecka.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {weeklyActivities.map((a, i) => (
            <Paper key={i} sx={{ p: 1.5, display: "flex", justifyContent: "space-between" }}>
              <Typography>{a.name}</Typography>
              <Typography color="text.secondary">{a.duration} min · {a.date}</Typography>
            </Paper>
          ))}
        </Box>
      )}

      <Typography variant="h6" mt={4} mb={1}>Dina loggar</Typography>
      {logs.length === 0 ? (
        <Typography color="text.secondary">Inga loggar än.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[...logs].reverse().map((l) => (
            <Paper key={l.id} sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography>{new Date(l.date).toLocaleDateString("sv-SE")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Humör {l.moodScore} · Stress {l.stressLevel} · Sömn {l.sleepHours}h
                </Typography>
              </Box>
              <Box>
                <Button size="small" onClick={() => navigate(`/log/${l.id}`)}>Redigera</Button>
                <Button size="small" color="error" onClick={() => handleDelete(l.id)}>Ta bort</Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}