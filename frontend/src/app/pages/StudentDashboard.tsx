import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Alert,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  People,
  AccessTime,
  DateRange,
  School,
  PersonAdd,
  PersonRemove,
  CheckCircle,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Schedule } from '@teacher-scheduler/shared-types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import scheduleService from '../services/scheduleService';

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

const StudentDashboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    scheduleId: string | null;
    action: 'enroll' | 'unenroll';
    scheduleName: string;
  }>({
    open: false,
    scheduleId: null,
    action: 'enroll',
    scheduleName: '',
  });

  // React Query: fetch all schedules
  const queryClient = useQueryClient();
  const {
    data: schedulesData,
    isLoading: loading,
    error: queryError,
  } = useQuery<Schedule[], Error>({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getAllSchedules(),
    staleTime: 60_000,
    retry: 1,
  });
  const allSchedules: Schedule[] = schedulesData ?? [];

  React.useEffect(() => {
    if (queryError) setError(queryError.message);
    console.log('Schedules loaded:', allSchedules.length, allSchedules);
  }, [queryError, allSchedules]);

  const getCurrentUserId = (): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        return null;
      }

      // Decode JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      console.log('Token payload:', payload);

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('Token is expired');
        localStorage.removeItem('token');
        return null;
      }

      return payload.userId || payload.id || payload._id || null;
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem('token'); // Remove invalid token
      return null;
    }
  };

  const enrollMutation = useMutation<Schedule, Error, string>({
    mutationFn: (id: string) => scheduleService.enrollInSchedule(id),
    onSuccess: () => {
      setSuccess('Successfully enrolled in the schedule!');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (e) => setError(e.message || 'Failed to enroll in schedule'),
  });

  const unenrollMutation = useMutation<Schedule, Error, string>({
    mutationFn: (id: string) => scheduleService.unenrollFromSchedule(id),
    onSuccess: () => {
      setSuccess('Successfully unenrolled from the schedule');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (e) => setError(e.message || 'Failed to unenroll from schedule'),
  });

  const openConfirmDialog = (
    scheduleId: string,
    action: 'enroll' | 'unenroll',
    scheduleName: string
  ) => {
    setConfirmDialog({
      open: true,
      scheduleId,
      action,
      scheduleName,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.scheduleId) return;

    try {
      setError(null);
      setSuccess(null);

      if (confirmDialog.action === 'enroll') {
        await enrollMutation.mutateAsync(confirmDialog.scheduleId);
      } else {
        await unenrollMutation.mutateAsync(confirmDialog.scheduleId);
      }
    } catch (error) {
      console.error('Action failed:', error);
      // Error is already handled by the mutation's onError callback
    } finally {
      setConfirmDialog({
        open: false,
        scheduleId: null,
        action: 'enroll',
        scheduleName: '',
      });
    }
  };

  const isEnrolled = (schedule: Schedule): boolean => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return false;

    return (
      schedule.enrolledStudents?.some((student) => {
        if (typeof student === 'string') {
          return student === currentUserId;
        }
        return student._id === currentUserId;
      }) || false
    );
  };

  const isFull = (schedule: Schedule): boolean => {
    return (schedule.enrolledStudents?.length || 0) >= schedule.maxStudents;
  };

  const renderScheduleCard = (schedule: Schedule, showActions = true) => (
    <Card
      key={schedule._id}
      sx={{
        mb: 3,
        transition: 'all 0.2s ease-in-out',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          borderColor: 'primary.main',
        },
        position: 'relative',
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
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
                {new Date(schedule.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
              <AccessTime
                sx={{ ml: 2, mr: 1, fontSize: 18, color: 'text.secondary' }}
              />
              <Typography variant="body2" color="text.secondary">
                {schedule.startTime} - {schedule.endTime}
              </Typography>
            </Box>
            {schedule.teacher && typeof schedule.teacher === 'object' && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: 'italic' }}
              >
                Teacher: {schedule.teacher.firstName}{' '}
                {schedule.teacher.lastName}
              </Typography>
            )}
          </Box>
          {showActions && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              {isEnrolled(schedule) ? (
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<PersonRemove />}
                  onClick={() =>
                    schedule._id &&
                    openConfirmDialog(
                      schedule._id,
                      'unenroll',
                      schedule.subject
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Unenroll
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={isFull(schedule) ? <CheckCircle /> : <PersonAdd />}
                  onClick={() =>
                    schedule._id &&
                    !isFull(schedule) &&
                    openConfirmDialog(schedule._id, 'enroll', schedule.subject)
                  }
                  disabled={isFull(schedule)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {isFull(schedule) ? 'Full' : 'Enroll'}
                </Button>
              )}
            </Box>
          )}
        </Box>

        {isEnrolled(schedule) && (
          <Chip
            label="Enrolled"
            color="success"
            size="small"
            icon={<CheckCircle />}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              fontWeight: 600,
            }}
          />
        )}

        {schedule.summary && (
          <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
            {schedule.summary}
          </Typography>
        )}

        {schedule.notes && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
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
            label={isFull(schedule) ? 'Full' : 'Available'}
            color={isFull(schedule) ? 'error' : 'success'}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );

  const currentUserId = getCurrentUserId();
  const mySchedules = useMemo(
    () =>
      allSchedules.filter((s: Schedule) => {
        if (!currentUserId || !s.enrolledStudents) return false;

        return s.enrolledStudents.some((student) => {
          if (typeof student === 'string') {
            return student === currentUserId;
          }
          return student._id === currentUserId;
        });
      }),
    [allSchedules, currentUserId]
  );

  const groupedBySubject = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    const now = new Date();
    allSchedules.forEach((s: Schedule) => {
      const scheduleDate = new Date(s.date);
      // Only show future schedules or today's schedules that haven't ended yet
      const scheduleDateTime = new Date(scheduleDate);
      const [hours, minutes] = s.endTime.split(':').map(Number);
      scheduleDateTime.setHours(hours, minutes, 0, 0);

      if (scheduleDateTime < now) return; // Skip past schedules

      const key = s.subject || 'Other';
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });

    // Sort schedules within each subject by date and time
    Object.keys(map).forEach((subject) => {
      map[subject].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allSchedules]);

  const renderAvailableTab = () => (
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
          Available Schedules (
          {groupedBySubject.reduce((acc, [, list]) => acc + list.length, 0)})
        </Typography>
        <Chip
          label={`${mySchedules.length} Enrolled`}
          color="primary"
          variant="outlined"
          sx={{ px: 1, fontWeight: 600 }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : groupedBySubject.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            No schedules available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check back later for new class schedules
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2 }}
            >
              Debug: Total schedules loaded: {allSchedules.length}
            </Typography>
          )}
        </Paper>
      ) : (
        <Box>
          {groupedBySubject.map(([subject, schedules]) => (
            <Box key={subject} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <School sx={{ mr: 1, color: 'primary.main' }} /> {subject}{' '}
                <Chip
                  size="small"
                  sx={{ ml: 2 }}
                  label={`${schedules.length}`}
                />
              </Typography>
              {schedules.map((s) => renderScheduleCard(s))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderEnrolledTab = () => (
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
          My Enrolled Schedules ({mySchedules.length})
        </Typography>
        <Button
          variant="contained"
          onClick={() => setActiveTab(0)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Browse More Schedules
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : mySchedules.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <PersonAdd sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography
            variant="h6"
            color="text.primary"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            No enrolled schedules yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enroll in available schedules to start learning
          </Typography>
          <Button
            variant="contained"
            onClick={() => setActiveTab(0)}
            sx={{ fontWeight: 600, textTransform: 'none', px: 3 }}
          >
            Browse Available Schedules
          </Button>
        </Paper>
      ) : (
        <Box sx={{ px: 2 }}>
          {mySchedules.map((s: Schedule) => renderScheduleCard(s, false))}
        </Box>
      )}
    </Box>
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
          Student Dashboard
        </Typography>
        <Chip
          label={`${mySchedules.length} Enrolled`}
          color="success"
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
          borderRadius: 3,
          overflow: 'hidden',
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
        elevation={0}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            px: 2,
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
          <Tab label="Available" />
          <Tab label={`Enrolled (${mySchedules.length})`} />
        </Tabs>
        <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <TabPanel value={activeTab} index={0}>
            {renderAvailableTab()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderEnrolledTab()}
          </TabPanel>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({
            open: false,
            scheduleId: null,
            action: 'enroll',
            scheduleName: '',
          })
        }
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {confirmDialog.action === 'enroll'
            ? 'Confirm Enrollment'
            : 'Confirm Unenrollment'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            {confirmDialog.action === 'enroll' ? 'enroll in' : 'unenroll from'}{' '}
            <strong>{confirmDialog.scheduleName}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                scheduleId: null,
                action: 'enroll',
                scheduleName: '',
              })
            }
            variant="contained"
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            color={confirmDialog.action === 'enroll' ? 'primary' : 'error'}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            {confirmDialog.action === 'enroll' ? 'Enroll' : 'Unenroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
