import { useEffect, useState } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { getInsights } from "../api/insights";

export default function InsightsCard() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    getInsights().then((res) => setInsights(res.data));
  }, []);

  if (!insights) return null;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" mb={1}>Dina insikter</Typography>
      <Typography>🔥 Du har loggat {insights.streak} dagar i rad</Typography>
      <Typography>
        😴 Humör efter under 7h sömn: {insights.avgMoodLowSleep.toFixed(1)} – efter 7h eller mer:{" "}
        {insights.avgMoodGoodSleep.toFixed(1)}
      </Typography>
      <Box mt={1}>
        <Typography fontWeight="bold">Aktiviteter med högst humör:</Typography>
        {insights.topActivities.map((a) => (
          <Typography key={a.activity}>
            {a.activity}: {a.avgMood.toFixed(1)}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
