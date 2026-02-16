import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alpha } from '@mui/material/styles';
import UserProfileModal from './UserProfileModal';

const drawerWidth = 240;

const Navbar = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const ismobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for Logout Confirmation Modal
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setOpenLogoutDialog(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,

        backgroundColor: "#3D52A0", // Requested solid blue
        color: "#FFFFFF",           // Requested white text
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)", // Subtle white border
        boxShadow: "none"
      }}
    >

      <Toolbar sx={{ height: 64, px: { xs: 2, md: 4 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand / Logo Area - Mobile Only */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: 'inherit',
            fontSize: '1.2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: 'none'
          }}>
            C
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1rem' }}>
            CRM SYSTEM
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Info Section - CLICKABLE */}
        <Box
          onClick={() => setOpenProfileModal(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            p: 0.5,
            pl: 2,
            pr: 1,
            borderRadius: '12px',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#FFFFFF', lineHeight: 1.2 }}>
              {user ? user.name : 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', lineHeight: 1.2 }}>
              {user ? user.role : 'Role'}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)", // Translucent white background
              color: "#FFFFFF",
              border: "2px solid #FFFFFF",
              fontWeight: 'bold',
              width: ismobile ? 32 : 40,
              height: ismobile ? 32 : 40,
              fontSize: '1rem'
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
        </Box>

        <Box sx={{ ml: 1 }}>
          <IconButton
            onClick={handleLogoutClick}
            sx={{
              color: '#FFFFFF',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: '#2F4287' }, // Darker blue on hover
              borderRadius: '8px',
              padding: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>

      {/* User Profile Modal */}
      <UserProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
        user={user}
      />

      {/* Logout Confirmation Modal */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            width: '100%',
            maxWidth: '400px',
            p: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <Box sx={{ p: 3, pb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Box sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            p: 1.5,
            borderRadius: '50%',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <LogoutIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1, color: '#101828' }}>
            Logout Confirmation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to logout?
          </Typography>
        </Box>

        <Box sx={{ p: 3, pt: 3, display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: '8px',
              color: '#344054',
              borderColor: '#D0D5DD',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: '#D0D5DD', bgcolor: '#F9FAFB' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            fullWidth
            disableElevation
            sx={{
              borderRadius: '8px',
              bgcolor: '#3D52A0',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#2A3B75' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Dialog>

    </AppBar>
  );
};

export default Navbar;
