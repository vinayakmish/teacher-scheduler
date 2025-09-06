import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Collapse,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  LockOutlined,
  School,
  Email,
  Visibility,
  VisibilityOff,
  LoginRounded,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '@teacher-scheduler/shared-types';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check if we're in development/demo mode
  const isDemoMode =
    process.env.NODE_ENV === 'development' ||
    process.env.REACT_APP_SHOW_DEMO_CREDENTIALS === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/');
    } catch {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
          sx={{ minHeight: '80vh' }}
        >
          {/* Left Side - Demo Credentials (Only in Demo Mode) */}
          {isDemoMode && (
            <Box sx={{ flex: { md: '0 0 40%' }, width: '100%' }}>
              <Fade in timeout={1200}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1,
                      }}
                    >
                      🚀 Demo Environment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick access credentials for testing
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                    endIcon={
                      showDemoCredentials ? <ExpandLess /> : <ExpandMore />
                    }
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {showDemoCredentials ? 'Hide' : 'Show'} Demo Credentials
                  </Button>

                  <Collapse in={showDemoCredentials}>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {/* Admin Credentials */}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() =>
                          fillDemoCredentials('admin@admin.com', 'admin')
                        }
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mb: 0.5, color: 'text.primary' }}
                        >
                          👨‍💼 Administrator
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'text.secondary',
                          }}
                        >
                          admin@admin.com / admin
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                        >
                          Click to auto-fill
                        </Typography>
                      </Paper>

                      {/* Teacher Credentials */}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() =>
                          fillDemoCredentials(
                            'john.doe@school.com',
                            'teacher123'
                          )
                        }
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mb: 0.5, color: 'text.primary' }}
                        >
                          👨‍🏫 Teacher
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'text.secondary',
                          }}
                        >
                          john.doe@school.com / teacher123
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                        >
                          Click to auto-fill
                        </Typography>
                      </Paper>

                      {/* Student Credentials */}
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          color: 'text.primary',
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          },
                        }}
                        onClick={() =>
                          fillDemoCredentials(
                            'alice.johnson@student.com',
                            'student123'
                          )
                        }
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ mb: 0.5, color: 'text.primary' }}
                        >
                          👨‍🎓 Student
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'text.secondary',
                          }}
                        >
                          alice.johnson@student.com / student123
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.7rem', color: 'text.secondary' }}
                        >
                          Click to auto-fill
                        </Typography>
                      </Paper>
                    </Box>
                  </Collapse>
                </Paper>
              </Fade>
            </Box>
          )}

          {/* Right Side - Login Form */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: { md: isDemoMode ? '60%' : '500px' },
            }}
          >
            <Slide direction="left" in timeout={800}>
              <Paper
                elevation={0}
                sx={{ maxWidth: 500, mx: 'auto', borderRadius: 3 }}
              >
                <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                  <Fade in timeout={1000}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Zoom in timeout={1200}>
                        <Avatar
                          sx={{
                            mx: 'auto',
                            mb: 3,
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            boxShadow: 'none',
                          }}
                        >
                          <School sx={{ fontSize: 30 }} />
                        </Avatar>
                      </Zoom>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 1,
                        }}
                      >
                        Teacher Scheduler
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '1rem',
                          opacity: 0.85,
                        }}
                      >
                        Sign in to access your dashboard
                      </Typography>
                    </Box>
                  </Fade>
                  <Fade in timeout={1600}>
                    <Box
                      component="form"
                      onSubmit={handleSubmit}
                      sx={{ mt: 4 }}
                    >
                      {error && (
                        <Slide direction="down" in timeout={300}>
                          <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                          </Alert>
                        </Slide>
                      )}

                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email
                                sx={{ color: 'primary.main', opacity: 0.7 }}
                              />
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />

                      <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        sx={{ mb: 4 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined
                                sx={{ color: 'primary.main', opacity: 0.7 }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowPassword}
                                edge="end"
                                sx={{ color: 'primary.main', opacity: 0.7 }}
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        variant="outlined"
                      />

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        startIcon={<LoginRounded />}
                        sx={{ py: 1.5, fontSize: '1.05rem', fontWeight: 600 }}
                      >
                        {isLoading ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CircularProgress size={20} color="inherit" />
                            Signing In...
                          </Box>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </Box>
                  </Fade>
                </CardContent>
              </Paper>
            </Slide>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
