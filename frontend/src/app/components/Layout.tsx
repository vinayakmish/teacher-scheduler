import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  LogoutOutlined,
  School,
  KeyboardArrowDown,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useColorMode } from './ColorModeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'teacher':
        return '👨‍🏫';
      case 'student':
        return '👨‍🎓';
      default:
        return '👤';
    }
  };

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'background.paper',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left side - Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
              transition: 'opacity 0.2s ease-in-out',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <School sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                EduFlow
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                Teacher Scheduler
              </Typography>
            </Box>
          </Box>

          {/* Right side - User info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip
              title={
                mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleColorMode();
                }}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(6px)',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {mode === 'dark' ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Chip
              label={`${getRoleIcon(
                user?.role || ''
              )} ${user?.role?.toUpperCase()}`}
              color={
                getRoleColor(user?.role || '') as
                  | 'error'
                  | 'primary'
                  | 'success'
                  | 'default'
              }
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                display: { xs: 'none', sm: 'flex' },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
              onClick={handleMenu}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </Avatar>

              <Stack spacing={0} sx={{ display: { xs: 'none', md: 'flex' } }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    lineHeight: 1.2,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {user?.email}
                </Typography>
              </Stack>

              <KeyboardArrowDown
                sx={{
                  fontSize: 20,
                  color: 'text.secondary',
                  transition: 'transform 0.2s ease-in-out',
                  transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </Box>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  minWidth: 200,
                  mt: 1,
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid',
                  borderColor: 'grey.200',
                },
              }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block' }}
                >
                  {user?.email}
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
                  sx={{ mt: 1, fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Box>
              <Divider />
              <MenuItem
                onClick={handleProfileClick}
                sx={{ py: 1.5, px: 2, gap: 1.5 }}
              >
                <AccountCircle sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">Profile Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2,
                  gap: 1.5,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <LogoutOutlined sx={{ fontSize: 20 }} />
                <Typography variant="body2">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          py: { xs: 3, md: 4 },
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Box>
        {/* Footer removed per request for cleaner minimal layout */}
      </Container>
    </Box>
  );
};

export default Layout;
