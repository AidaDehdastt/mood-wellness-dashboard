import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Slider, TextField, Button, MenuItem, Select, Chip } from "@mui/material";
import { createDailyLog } from "../api/dailyLogs";
import { getActivities } from "../api/activities";

export default function LogEntry() {
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState("");
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [duration, setDuration] = useState(30);
  const [loggedActivities, setLoggedActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getActivities().then((res) => setActivities(res.data));
  }, []);

  const addActivity = () => {
    if (!selectedActivity) return;
    setLoggedActivities([...loggedActivities, { activityId: selectedActivity, durationMinutes: duration }]);
    setSelectedActivity("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDailyLog({
      date: new Date().toISOString(),
      moodScore: mood,
      stressLevel: stress,
      sleepHours: sleep,
      notes,
      activities: loggedActivities,
    });
    navigate("/dashboard");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: "auto", mt: 6 }}>
      <Typography variant="h5" mb={3}>Logga dagen</Typography>

      <Typography>Humör: {mood}/10</Typography>
      <Slider value={mood} onChange={(e, v) => setMood(v)} min={1} max={10} />

      <Typography>Stressnivå: {stress}/10</Typography>
      <Slider value={stress} onChange={(e, v) => setStress(v)} min={1} max={10} />

      <Typography>Sömntimmar: {sleep}h</Typography>
      <Slider value={sleep} onChange={(e, v) => setSleep(v)} min={0} max={12} step={0.5} />

      <TextField
        label="Anteckningar" fullWidth multiline rows={2} sx={{ mt: 2 }}
        value={notes} onChange={(e) => setNotes(e.target.value)}
      />

      <Typography sx={{ mt: 3 }}>Aktiviteter idag</Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
        <Select value={selectedActivity} onChange={(e) => setSelectedActivity(e.target.value)} sx={{ minWidth: 150 }}>
          {activities.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
          ))}
        </Select>
        <TextField
          type="number" label="Minuter" value={duration}
          onChange={(e) => setDuration(Number(e.target.value))} sx={{ width: 100 }}
        />
        <Button onClick={addActivity} variant="outlined">Lägg till</Button>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        {loggedActivities.map((a, i) => {
          const activity = activities.find((x) => x.id === a.activityId);
          return <Chip key={i} label={`${activity?.name} – ${a.durationMinutes} min`} />;
        })}
      </Box>

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
        Spara logg
      </Button>
    </Box>
  );
}