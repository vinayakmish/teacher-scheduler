import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  People,
  School,
  Class,
  TrendingUp,
  PersonAdd,
  Analytics,
  Delete,
  AdminPanelSettings,
} from '@mui/icons-material';
import { User, UserRole, Schedule } from '@teacher-scheduler/shared-types';
import { userService } from '../services/userService';
import { scheduleService } from '../services/scheduleService';
import { dashboardService } from '../services/dashboardService';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSchedules: number;
  activeSchedules: number;
  enrollmentCount: number;
}

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string; // palette key prefix
}> = ({ label, value, icon, color }) => (
  <Card>
    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              lineHeight: 1.15,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 0.5, fontWeight: 500 }}
          >
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            fontSize: 28,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const StatLine: React.FC<{
  label: string;
  value: number | string;
  accent: string;
}> = ({ label, value, accent }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 1.25,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, color: accent }}>
      {value}
    </Typography>
  </Box>
);

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSchedules: 0,
    activeSchedules: 0,
    enrollmentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.STUDENT,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchUsers(), fetchSchedules(), fetchDashboardStats()]);
  };

  const fetchDashboardStats = async () => {
    try {
      const s = await dashboardService.getDashboardStats();
      setStats(s);
    } catch (err) {
      // fallback
      calculateStats(users, schedules);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await userService.getAllUsers();
      setUsers(list);
      calculateStats(list, schedules);
    } catch (err: unknown) {
      const e = err as Error;
      if (e.name === 'NetworkError') setError('Unable to reach server.');
      else if (e.message.includes('401')) setError('Session expired.');
      else if (e.message.includes('403')) setError('Access denied.');
      else setError(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const list = await scheduleService.getAllSchedules();
      setSchedules(list);
      calculateStats(users, list);
    } catch {
      // non critical
    }
  };

  const calculateStats = (userList: User[], scheduleList: Schedule[]) => {
    const teachers = userList.filter((u) => u.role === UserRole.TEACHER);
    const students = userList.filter((u) => u.role === UserRole.STUDENT);
    const now = new Date();
    const activeSchedules = scheduleList.filter((s) => new Date(s.date) >= now);
    const enrollmentCount = scheduleList.reduce(
      (acc, s) => acc + (s.enrolledStudents?.length || 0),
      0
    );
    setStats({
      totalUsers: userList.length,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      totalSchedules: scheduleList.length,
      activeSchedules: activeSchedules.length,
      enrollmentCount,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await userService.registerUser(registerForm);
      setSuccess('User registered successfully');
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
      });
      fetchUsers();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Registration failed');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      setSuccess('User deleted');
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Delete failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<UserRole>) => {
    setRegisterForm((prev) => ({ ...prev, role: e.target.value as UserRole }));
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  const handleTabChange = (_: React.SyntheticEvent, v: number) =>
    setActiveTab(v);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderDashboardTab = () => (
    <Box sx={{ px: { xs: 0, md: 2 } }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mb: 4, fontWeight: 700, textAlign: { xs: 'center', md: 'left' } }}
      >
        Overview
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<People fontSize="inherit" />}
          color="primary"
        />
        <StatCard
          label="Teachers"
          value={stats.totalTeachers}
          icon={<School fontSize="inherit" />}
          color="secondary"
        />
        <StatCard
          label="Students"
          value={stats.totalStudents}
          icon={<People fontSize="inherit" />}
          color="info"
        />
        <StatCard
          label="Active Schedules"
          value={stats.activeSchedules}
          icon={<Class fontSize="inherit" />}
          color="warning"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
          gap: 2,
        }}
      >
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <Analytics sx={{ mr: 1.25, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Statistics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <StatLine
                label="Total Schedules"
                value={stats.totalSchedules}
                accent="primary.main"
              />
              <StatLine
                label="Enrollments"
                value={stats.enrollmentCount}
                accent="secondary.main"
              />
              <StatLine
                label="Avg / Schedule"
                value={
                  stats.totalSchedules
                    ? Math.round(stats.enrollmentCount / stats.totalSchedules)
                    : 0
                }
                accent="success.main"
              />
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <TrendingUp sx={{ mr: 1.25, color: 'success.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setActiveTab(2)}
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Register User
              </Button>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => setActiveTab(1)}
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Manage Users
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  const renderUsersTab = () => (
    <Box sx={{ px: { xs: 0, md: 2 } }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mb: 4, fontWeight: 700, textAlign: { xs: 'center', md: 'left' } }}
      >
        User Management
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Email', 'Role', 'Created', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 600 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.role === UserRole.ADMIN && (
                        <AdminPanelSettings color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={
                        getRoleColor(user.role) as
                          | 'error'
                          | 'primary'
                          | 'success'
                          | 'default'
                      }
                      size="small"
                      sx={{ fontWeight: 600, minWidth: 72 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {user.role !== UserRole.ADMIN && user._id ? (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => openDeleteDialog(user)}
                      >
                        <Delete />
                      </IconButton>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        Protected
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderRegisterTab = () => (
    <Box sx={{ px: { xs: 0, md: 2 }, maxWidth: 700 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ mb: 4, fontWeight: 700, textAlign: { xs: 'center', md: 'left' } }}
      >
        Register New User
      </Typography>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
                gap: 2,
              }}
            >
              <TextField
                name="firstName"
                label="First Name"
                value={registerForm.firstName}
                onChange={handleInputChange}
                required
                fullWidth
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={registerForm.lastName}
                onChange={handleInputChange}
                required
                fullWidth
              />
            </Box>
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={registerForm.email}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              name="password"
              label="Password"
              type="password"
              value={registerForm.password}
              onChange={handleInputChange}
              required
              fullWidth
              inputProps={{ minLength: 6 }}
              helperText="Minimum 6 characters"
            />
            <FormControl fullWidth>
              <InputLabel>User Role</InputLabel>
              <Select
                value={registerForm.role}
                label="User Role"
                onChange={handleSelectChange}
                required
              >
                <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
                <MenuItem value={UserRole.TEACHER}>Teacher</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Administrator</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{ fontWeight: 600 }}
            >
              Register User
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, md: 4 },
          px: { xs: 0, md: 2 },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textAlign: { xs: 'center', md: 'left' },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          Admin Dashboard
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3, mx: { xs: 0, md: 2 } }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, mx: { xs: 0, md: 2 } }}>
          {success}
        </Alert>
      )}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 4,
          mx: { xs: 0, md: 2 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ '& .MuiTab-root': { fontWeight: 500, minHeight: 48 } }}
        >
          <Tab label="Overview" />
          <Tab label="Users" />
          <Tab label="Register" />
        </Tabs>
      </Box>
      <Box>
        {activeTab === 0 && renderDashboardTab()}
        {activeTab === 1 && renderUsersTab()}
        {activeTab === 2 && renderRegisterTab()}
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Delete user{' '}
            <strong>
              {userToDelete?.firstName} {userToDelete?.lastName}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() =>
              userToDelete?._id && handleDeleteUser(userToDelete._id)
            }
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
