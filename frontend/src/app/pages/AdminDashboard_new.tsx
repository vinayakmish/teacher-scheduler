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
import {
  User,
  UserRole,
  ApiResponse,
  Schedule,
} from '@teacher-scheduler/shared-types';
import { authService } from '../services/authService';

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
    await Promise.all([fetchUsers(), fetchSchedules()]);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        const users = Array.isArray(data.data) ? data.data : [];
        setUsers(users);
        calculateStats(users, schedules);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/schedules', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        const schedules = Array.isArray(data.data) ? data.data : [];
        setSchedules(schedules);
        calculateStats(users, schedules);
      }
    } catch {
      // Silently fail for schedules
    }
  };

  const calculateStats = (userList: User[], scheduleList: Schedule[]) => {
    const teachers = userList.filter((user) => user.role === UserRole.TEACHER);
    const students = userList.filter((user) => user.role === UserRole.STUDENT);
    const now = new Date();
    const activeSchedules = scheduleList.filter(
      (schedule) => new Date(schedule.date) >= now
    );
    const totalEnrollments = scheduleList.reduce(
      (sum, schedule) => sum + (schedule.enrolledStudents?.length || 0),
      0
    );

    setStats({
      totalUsers: userList.length,
      totalTeachers: teachers.length,
      totalStudents: students.length,
      totalSchedules: scheduleList.length,
      activeSchedules: activeSchedules.length,
      enrollmentCount: totalEnrollments,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await authService.register(registerForm);
      setSuccess('User registered successfully!');
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
      });
      fetchUsers();
    } catch {
      setError('Registration failed');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch {
      setError('Failed to delete user');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setRegisterForm((prev) => ({
      ...prev,
      role: e.target.value as UserRole,
    }));
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

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

  // Dashboard Overview Tab
  const renderDashboardTab = () => (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard Overview
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        <Card
          sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <CardContent sx={{ color: 'white' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant="body1">Total Users</Typography>
              </Box>
              <People sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }}
        >
          <CardContent sx={{ color: 'white' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalTeachers}
                </Typography>
                <Typography variant="body1">Teachers</Typography>
              </Box>
              <School sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          }}
        >
          <CardContent sx={{ color: 'white' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalStudents}
                </Typography>
                <Typography variant="body1">Students</Typography>
              </Box>
              <People sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          }}
        >
          <CardContent sx={{ color: 'white' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.activeSchedules}
                </Typography>
                <Typography variant="body1">Active Schedules</Typography>
              </Box>
              <Class sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
          gap: 3,
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Analytics sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">System Statistics</Typography>
            </Box>

            <Box sx={{ space: 2 }}>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
              >
                <Typography variant="body2">Total Schedules:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stats.totalSchedules}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
              >
                <Typography variant="body2">Total Enrollments:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stats.enrollmentCount}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}
              >
                <Typography variant="body2">
                  Avg. Students per Schedule:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {stats.totalSchedules > 0
                    ? Math.round(stats.enrollmentCount / stats.totalSchedules)
                    : 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Quick Actions</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => setActiveTab(2)}
                fullWidth
              >
                Register New User
              </Button>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => setActiveTab(1)}
                fullWidth
              >
                Manage Users
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Users Management Tab
  const renderUsersTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        User Management
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                      {user.firstName} {user.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
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
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {user.role !== UserRole.ADMIN && user._id && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => user._id && openDeleteDialog(user)}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  // Register User Tab
  const renderRegisterTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Register New User
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
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

            <TextField
              name="email"
              label="Email"
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
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={registerForm.role}
                label="Role"
                onChange={handleSelectChange}
                required
              >
                <MenuItem value={UserRole.STUDENT}>Student</MenuItem>
                <MenuItem value={UserRole.TEACHER}>Teacher</MenuItem>
                <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAdd />}
              sx={{ mt: 2 }}
            >
              Register User
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Dashboard" />
          <Tab label="Manage Users" />
          <Tab label="Register User" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderDashboardTab()}
      {activeTab === 1 && renderUsersTab()}
      {activeTab === 2 && renderRegisterTab()}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user {userToDelete?.firstName}{' '}
            {userToDelete?.lastName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
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
