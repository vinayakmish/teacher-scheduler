import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  Fade,
  IconButton,
  Container,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Security,
  Save,
  Edit,
  AdminPanelSettings,
  School,
  Groups,
  VpnKey,
  Close,
  Email,
  Badge,
  CalendarToday,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { User, UserRole } from '@teacher-scheduler/shared-types';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileUpdateForm {
  firstName: string;
  lastName: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileForm, setProfileForm] = useState<ProfileUpdateForm>({
    firstName: '',
    lastName: '',
  });

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getUserProfile();
      setUser(profile);
      setProfileForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const updatedUser = await userService.updateProfile(profileForm);
      setUser(updatedUser);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setSubmitting(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setSubmitting(false);
      return;
    }

    try {
      await userService.changePassword(passwordForm);
      setSuccess('Password changed successfully!');
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <AdminPanelSettings sx={{ color: '#ef4444' }} />;
      case UserRole.TEACHER:
        return <School sx={{ color: '#2563eb' }} />;
      case UserRole.STUDENT:
        return <Groups sx={{ color: '#10b981' }} />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.TEACHER:
        return 'primary';
      case UserRole.STUDENT:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading profile...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Fade in timeout={600}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Profile Settings
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Manage your account information and security settings
          </Typography>
        </Box>
      </Fade>

      {/* Alerts */}
      {error && (
        <Fade in timeout={300}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'error.light',
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError(null)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {success && (
        <Fade in timeout={300}>
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
            }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSuccess(null)}
              >
                <Close fontSize="inherit" />
              </IconButton>
            }
          >
            {success}
          </Alert>
        </Fade>
      )}

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
        }}
      >
        {/* Profile Card */}
        <Box sx={{ flex: { xs: '1', lg: '0 0 350px' } }}>
          <Fade in timeout={800}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                },
              }}
            >
              <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      border: '3px solid rgba(255,255,255,0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </Avatar>

                  <Typography variant="h4" fontWeight={700} mb={1}>
                    {user?.firstName} {user?.lastName}
                  </Typography>

                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                    {user?.email}
                  </Typography>

                  <Chip
                    icon={getRoleIcon(user?.role || '')}
                    label={user?.role?.toUpperCase()}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                </Box>

                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.3)', my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Member since
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge sx={{ opacity: 0.8 }} />
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        User ID
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        fontFamily="monospace"
                      >
                        {user?._id?.slice(-8)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>

        {/* Settings Panel */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Profile Information Section */}
            <Fade in timeout={1000}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={700}>
                          Profile Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Update your personal details
                        </Typography>
                      </Box>
                    </Box>

                    {!editMode && (
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => setEditMode(true)}
                        sx={{ borderRadius: 2 }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>

                  {editMode ? (
                    <Box component="form" onSubmit={handleProfileUpdate}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' },
                          }}
                        >
                          <TextField
                            fullWidth
                            label="First Name"
                            value={profileForm.firstName}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                firstName: e.target.value,
                              })
                            }
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                          <TextField
                            fullWidth
                            label="Last Name"
                            value={profileForm.lastName}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                lastName: e.target.value,
                              })
                            }
                            required
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <TextField
                          fullWidth
                          label="Email Address"
                          value={user?.email || ''}
                          disabled
                          helperText="Email cannot be changed for security reasons"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={submitting}
                          sx={{
                            borderRadius: 2,
                            px: 3,
                          }}
                        >
                          {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(false);
                            setProfileForm({
                              firstName: user?.firstName || '',
                              lastName: user?.lastName || '',
                            });
                          }}
                          sx={{ borderRadius: 2, px: 3 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                          >
                            First Name
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {user?.firstName}
                          </Typography>
                        </Paper>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            flex: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                          >
                            Last Name
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {user?.lastName}
                          </Typography>
                        </Paper>
                      </Box>

                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={1}
                        >
                          Email Address
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                          {user?.email}
                        </Typography>
                      </Paper>

                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={1}
                        >
                          Role
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          {getRoleIcon(user?.role || '')}
                          <Typography variant="h6" fontWeight={600}>
                            {user?.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : 'N/A'}
                          </Typography>
                          <Chip
                            label={user?.role?.toUpperCase()}
                            color={
                              getRoleColor(user?.role || '') as
                                | 'error'
                                | 'primary'
                                | 'success'
                                | 'default'
                            }
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>

            {/* Security Section */}
            <Fade in timeout={1200}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <Security />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        Security Settings
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your account security
                      </Typography>
                    </Box>
                  </Box>

                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <VpnKey />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} mb={1}>
                          Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Keep your account secure with a strong password
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      startIcon={<Security />}
                      onClick={() => setPasswordDialogOpen(true)}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                      }}
                    >
                      Change Password
                    </Button>
                  </Paper>
                </CardContent>
              </Card>
            </Fade>
          </Box>
        </Box>
      </Box>

      {/* Password Change Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={400}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 2,
          }}
        >
          Change Password
          <IconButton
            onClick={() => setPasswordDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            mb={3}
            textAlign="center"
          >
            Enter your current password and choose a new secure password
          </Typography>

          <Box
            component="form"
            onSubmit={handlePasswordChange}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
          >
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      edge="end"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              required
              inputProps={{ minLength: 6 }}
              helperText="Minimum 6 characters required"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setPasswordDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={submitting}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
