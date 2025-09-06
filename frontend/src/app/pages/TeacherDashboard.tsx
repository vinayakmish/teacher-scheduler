import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  People,
  AccessTime,
  DateRange,
  School,
  Save,
  Cancel,
} from '@mui/icons-material';
import {
  Schedule,
  CreateScheduleRequest,
  ApiResponse,
} from '@teacher-scheduler/shared-types';

interface ScheduleForm extends Omit<CreateScheduleRequest, 'date'> {
  date: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherDashboard: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
    summary: '',
    maxStudents: 20,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Fetching schedules...');

      const response = await fetch('/api/schedules', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch schedules response status:', response.status);

      const data: ApiResponse = await response.json();
      console.log('Fetch schedules response data:', data);

      if (data.success) {
        setSchedules((data.data as Schedule[]) || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
      setError('Failed to fetch schedules. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate form data
    if (
      !scheduleForm.subject ||
      !scheduleForm.date ||
      !scheduleForm.startTime ||
      !scheduleForm.endTime
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (scheduleForm.startTime >= scheduleForm.endTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      console.log('Creating schedule with data:', scheduleForm);

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleForm),
      });

      console.log('Response status:', response.status);

      const data: ApiResponse = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setSuccess('Schedule created successfully!');
        setScheduleForm({
          subject: '',
          date: '',
          startTime: '',
          endTime: '',
          notes: '',
          summary: '',
          maxStudents: 20,
        });
        fetchSchedules();
        setActiveTab(0);
      } else {
        setError(data.error || 'Failed to create schedule');
      }
    } catch (error) {
      console.error('Create schedule error:', error);
      setError('Failed to create schedule. Please check your connection.');
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schedules/${editingSchedule._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleForm),
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        setSuccess('Schedule updated successfully!');
        setEditingSchedule(null);
        fetchSchedules();
        setActiveTab(0);
      } else {
        setError(data.error || 'Failed to update schedule');
      }
    } catch {
      setError('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        setSuccess('Schedule deleted successfully');
        fetchSchedules();
      } else {
        setError(data.error || 'Failed to delete schedule');
      }
    } catch {
      setError('Failed to delete schedule');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: name === 'maxStudents' ? parseInt(value, 10) : value,
    }));
  };

  const startEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      subject: schedule.subject,
      date: new Date(schedule.date).toISOString().split('T')[0],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      notes: schedule.notes || '',
      summary: schedule.summary || '',
      maxStudents: schedule.maxStudents,
    });
    setActiveTab(1);
  };

  const cancelEdit = () => {
    setEditingSchedule(null);
    setScheduleForm({
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
      summary: '',
      maxStudents: 20,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      cancelEdit();
    }
  };

  const renderScheduleCard = (schedule: Schedule) => (
    <Card
      key={schedule._id}
      sx={{
        mb: 2,
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}
            >
              <School
                sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }}
              />
              {schedule.subject}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DateRange
                sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                {new Date(schedule.date).toLocaleDateString()}
              </Typography>
              <AccessTime
                sx={{ ml: 2, mr: 1, fontSize: 18, color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                {schedule.startTime} - {schedule.endTime}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              color="primary"
              size="small"
              onClick={() => startEdit(schedule)}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => schedule._id && handleDeleteSchedule(schedule._id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {schedule.summary && (
          <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
            {schedule.summary}
          </Typography>
        )}

        {schedule.notes && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}
            >
              Notes:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {schedule.notes}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <People sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {schedule.enrolledStudents?.length || 0} / {schedule.maxStudents}{' '}
              students
            </Typography>
          </Box>
          <Chip
            label={
              (schedule.enrolledStudents?.length || 0) >= schedule.maxStudents
                ? 'Full'
                : 'Available'
            }
            color={
              (schedule.enrolledStudents?.length || 0) >= schedule.maxStudents
                ? 'error'
                : 'success'
            }
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderSchedulesTab = () => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          My Schedules ({schedules.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setActiveTab(1);
            cancelEdit();
          }}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Create Schedule
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : schedules.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <School sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            No schedules created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first schedule to get started with teaching
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setActiveTab(1)}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Create Your First Schedule
          </Button>
        </Paper>
      ) : (
        <Box>{schedules.map(renderScheduleCard)}</Box>
      )}
    </Box>
  );

  const renderCreateTab = () => (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
      </Typography>

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            component="form"
            onSubmit={
              editingSchedule ? handleUpdateSchedule : handleCreateSchedule
            }
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={scheduleForm.subject}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mathematics, English Literature, Physics"
              variant="outlined"
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={scheduleForm.date}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="time"
                value={scheduleForm.startTime}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="time"
                value={scheduleForm.endTime}
                onChange={handleInputChange}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Maximum Students"
              name="maxStudents"
              type="number"
              value={scheduleForm.maxStudents}
              onChange={handleInputChange}
              required
              inputProps={{ min: 1, max: 100 }}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Summary"
              name="summary"
              value={scheduleForm.summary}
              onChange={handleInputChange}
              placeholder="Brief description of the class"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={scheduleForm.notes}
              onChange={handleInputChange}
              multiline
              rows={4}
              placeholder="Additional notes, requirements, or instructions"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
              {editingSchedule && (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Cancel />}
                  onClick={cancelEdit}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1400, p: { xs: 2.5, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          Teacher Dashboard
        </Typography>
        <Chip
          label={`${schedules.length} Schedule${
            schedules.length !== 1 ? 's' : ''
          }`}
          color="default"
          variant="outlined"
          sx={{ px: 1, fontWeight: 600 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Paper
        sx={{
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          borderRadius: 3,
        }}
        elevation={0}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.9rem', md: '0.95rem' },
              minHeight: 48,
              color: 'text.secondary',
              letterSpacing: 0.2,
              '&.Mui-selected': {
                color: 'text.primary',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '0 0 4px 4px',
            },
          }}
        >
          <Tab label="Schedules" />
          <Tab label={editingSchedule ? 'Edit' : 'Create'} />
        </Tabs>
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <TabPanel value={activeTab} index={0}>
            {renderSchedulesTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderCreateTab()}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherDashboard;
