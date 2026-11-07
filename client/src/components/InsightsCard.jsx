import { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress, Alert, Chip, Stack } from "@mui/material";
import { getInsights } from "../api/insights";

const format = (value) => (value == null ? "–" : value.toFixed(1));

export default function InsightsCard({ refreshKey }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Vid omhämtning ligger gamla insikter kvar tills nya data kommer.
    getInsights(8)
      .then((res) => {
        if (cancelled) return;
        setInsights(res.data);
        setError(null);
      })
      .catch(() => !cancelled && setError("Kunde inte hämta insikter just nu."))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (loading) return <Box sx={{ mb: 3 }}><CircularProgress size={24} /></Box>;
  if (error) return <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>;
  if (!insights || insights.totalLogs === 0) {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Dina insikter</Typography>
        <Typography color="text.secondary">Logga några dagar så visas dina samband här.</Typography>
      </Paper>
    );
  }

  const { sleepMood, topActivities, currentStreakDays, periodWeeks } = insights;
  const hasBothSleepGroups = sleepMood.avgMoodLowSleep != null && sleepMood.avgMoodGoodSleep != null;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" mb={1}>Dina insikter (senaste {periodWeeks} veckorna)</Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} mb={2}>
        <Chip color="primary" label={`🔥 ${currentStreakDays} dagar i rad`} />
        <Chip variant="outlined" label={`${insights.totalLogs} loggar i perioden`} />
      </Stack>

      <Typography fontWeight="bold">Sömn och humör</Typography>
      {hasBothSleepGroups ? (
        <Typography mb={2}>
          Efter under {sleepMood.sleepThresholdHours} h sömn: snitthumör {format(sleepMood.avgMoodLowSleep)}{" "}
          ({sleepMood.lowSleepCount} dagar). Efter {sleepMood.sleepThresholdHours} h eller mer:{" "}
          {format(sleepMood.avgMoodGoodSleep)} ({sleepMood.goodSleepCount} dagar).
        </Typography>
      ) : (
        <Typography color="text.secondary" mb={2}>
          Logga både kortare och längre nätter för att kunna jämföra.
        </Typography>
      )}

      <Typography fontWeight="bold">Aktiviteter som hänger ihop med högst humör</Typography>
      {topActivities.length === 0 ? (
        <Typography color="text.secondary">Logga en aktivitet minst två gånger för att se den här.</Typography>
      ) : (
        topActivities.map((a) => (
          <Typography key={a.activityId}>
            {a.name}: snitthumör {format(a.avgMood)} ({a.timesLogged} gånger)
          </Typography>
        ))
      )}
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Sambanden visar vad som brukar sammanfalla, inte vad som orsakar vad.
      </Typography>
    </Paper>
  );
}
