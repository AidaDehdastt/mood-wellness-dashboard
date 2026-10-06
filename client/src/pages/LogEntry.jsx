import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Slider, TextField, Button, MenuItem, Select, Chip, Alert } from "@mui/material";
import { createDailyLog, getDailyLog, updateDailyLog } from "../api/dailyLogs";
import { getActivities, createActivity, deleteActivity } from "../api/activities";

export default function LogEntry() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState("");
  const [logDate, setLogDate] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [duration, setDuration] = useState(30);
  const [loggedActivities, setLoggedActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getActivities().then((res) => setActivities(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getDailyLog(id)
      .then((res) => {
        const l = res.data;
        setMood(l.moodScore);
        setStress(l.stressLevel);
        setSleep(l.sleepHours);
        setNotes(l.notes ?? "");
        setLogDate(l.date);
        setLoggedActivities(
          (l.activityLogs || []).map((al) => ({
            activityId: al.activityId,
            durationMinutes: al.durationMinutes,
          }))
        );
      })
      .catch(() => setError("Kunde inte hämta loggen."));
  }, [id, isEdit]);

  const addActivity = () => {
    if (!selectedActivity) return;
    setLoggedActivities([...loggedActivities, { activityId: selectedActivity, durationMinutes: duration }]);
    setSelectedActivity("");
  };

  const removeActivity = (index) => {
    setLoggedActivities(loggedActivities.filter((_, i) => i !== index));
  };

  const handleAddNewActivity = async () => {
    if (!newActivityName || !newActivityCategory) return;
    setError("");
    try {
      const res = await createActivity({ name: newActivityName, category: newActivityCategory });
      setActivities([...activities, res.data]);
      setNewActivityName("");
      setNewActivityCategory("");
    } catch {
      setError("Kunde inte skapa aktiviteten.");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    setError("");
    try {
      await deleteActivity(activityId);
      setActivities(activities.filter((a) => a.id !== activityId));
    } catch (err) {
      setError(
        err.response?.data ?? "Kunde inte ta bort aktiviteten."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      date: isEdit ? logDate : new Date().toISOString(),
      moodScore: mood,
      stressLevel: stress,
      sleepHours: sleep,
      notes,
      activities: loggedActivities,
    };
    try {
      if (isEdit) {
        await updateDailyLog(id, payload);
      } else {
        await createDailyLog(payload);
      }
      navigate("/dashboard");
    } catch {
      setError("Kunde inte spara loggen.");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: "auto", mt: 6 }}>
      <Typography variant="h5" mb={3}>{isEdit ? "Redigera logg" : "Logga dagen"}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{String(error)}</Alert>}

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

      <Typography sx={{ mt: 3 }}>Aktiviteter</Typography>
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
        <Button onClick={addActivity} type="button" variant="outlined">Lägg till</Button>
      </Box>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        {loggedActivities.map((a, i) => {
          const activity = activities.find((x) => x.id === a.activityId);
          return (
            <Chip
              key={i}
              label={`${activity?.name} – ${a.durationMinutes} min`}
              onDelete={() => removeActivity(i)}
            />
          );
        })}
      </Box>

      <Typography sx={{ mt: 3 }} variant="body2" color="text.secondary">
        Hittar du inte aktiviteten? Lägg till en ny:
      </Typography>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
        <TextField
          label="Namn" size="small" value={newActivityName}
          onChange={(e) => setNewActivityName(e.target.value)}
        />
        <TextField
          label="Kategori" size="small" value={newActivityCategory}
          onChange={(e) => setNewActivityCategory(e.target.value)}
        />
        <Button onClick={handleAddNewActivity} type="button" variant="text">Skapa</Button>
      </Box>

      <Typography sx={{ mt: 3 }} variant="body2" color="text.secondary">
        Hantera aktivitetstyper:
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
        {activities.map((a) => (
          <Chip
            key={a.id}
            label={a.name}
            onDelete={() => handleDeleteActivity(a.id)}
            variant="outlined"
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
        <Button type="button" variant="outlined" onClick={() => navigate("/dashboard")}>
          Avbryt
        </Button>
        <Button type="submit" variant="contained" fullWidth>
          {isEdit ? "Spara ändringar" : "Spara logg"}
        </Button>
      </Box>
    </Box>
  );
}