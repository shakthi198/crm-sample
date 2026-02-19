import React, { useState, useEffect } from "react";
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { alpha } from "@mui/material/styles";
import UserProfileModal from "./UserProfileModal";
import apiEndpoints from "../apiconfig";

const drawerWidth = 240;

const Navbar = ({ handleDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const ismobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for Logout Confirmation Modal
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  // Organizations Dropdown State
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState(
    localStorage.getItem("organization_guid") || "",
  );
const [showNavbar, setShowNavbar] = useState(true);

useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY === 0) {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  
  React.useEffect(() => {
    if (user?.role === "Admin") {
      const fetchOrganizations = async () => {
        try {
          const response = await fetch(apiEndpoints.organizations, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setOrganizations(data.data);

            // Set default if not already selected
            if (!selectedOrganization && data.data.length > 0) {
              const defaultOrg = data.data[0].organization_guid;
              setSelectedOrganization(defaultOrg);
              localStorage.setItem("organization_guid", defaultOrg);
            }
          }
        } catch (error) {
          console.error("Error fetching organizations:", error);
        }
      };
      fetchOrganizations();
    }
  }, [user]);

  const handleOrganizationChange = (event) => {
    const orgGuid = event.target.value;

    setSelectedOrganization(orgGuid);

    localStorage.setItem("organization_guid", orgGuid);

    // ✅ This is enough
    window.dispatchEvent(new Event("organizationChanged"));
  };

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setOpenLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setOpenLogoutDialog(false);
    logout();
    navigate("/login");
  };

  const handleLogoutCancel = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={(theme) => ({
        top: 12,
        left: 12,
        right: 12,

        width: "auto",
        borderRadius: "18px",

        backgroundColor: "#E6D8C9",
        color: "#0F172A",

        backdropFilter: "blur(6px)",

        zIndex: {
          xs: theme.zIndex.drawer - 1,
          md: theme.zIndex.drawer + 10,
        },

        transform: showNavbar ? "translateY(0)" : "translateY(-120px)",
        opacity: showNavbar ? 1 : 0,

        transition: "all 0.35s ease",

        [theme.breakpoints.up("md")]: {
          left: `${drawerWidth + 24}px`,
          right: 24,
        },

        [theme.breakpoints.down("sm")]: {
          top: 8,
          left: 8,
          right: 8,
          borderRadius: "12px",
        },
      })}
    >
      <Toolbar
        sx={{
          height: 64,
          px: { xs: 2, md: 3 },
          justifyContent: { xs: "space-between", md: "flex-end" },
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand / Logo Area - Mobile Only */}
        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "rgba(255, 255, 255, 0.2)",
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "inherit",
              fontSize: "1.2rem",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "none",
              display: { xs: "none", sm: "flex" },
            }}
          >
            C
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.025em",
              fontSize: { xs: "1rem", sm: "1.2rem" },
            }}
          >
            {ismobile ? "CRM" : "CRM SYSTEM"}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, mr: { xs: 0.5, md: 1 } }} />

        {/* Organizations Dropdown - Admin Only */}
        {user?.role === "Admin" && (
          <FormControl
            size="small"
            sx={{
              mr: 2,
              minWidth: { xs: 100, sm: 150, md: 200 },
              display: "flex", // Hide on mobile if needed, or adjust
            }}
          >
            <Select
              value={selectedOrganization}
              onChange={handleOrganizationChange}
              displayEmpty
              variant="outlined"
              sx={{
                color: "#0F172A",
                height: ismobile ? 32 : 40,
                borderRadius: "8px",
                backgroundColor: "#ffffff41",

                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "#462b2b",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#462b2b",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#462b2b",
                },
                ".MuiSvgIcon-root": {
                  color: "#0F172A",
                },
              }}
              inputProps={{ "aria-label": "Select Organization" }}
            >
              <MenuItem value="" disabled>
                <em>Select Organization</em>
              </MenuItem>
              {organizations.map((org) => (
                <MenuItem
                  key={org.organization_guid}
                  value={org.organization_guid}
                >
                  {org.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* User Info Section - CLICKABLE */}
        <Box
          onClick={() => setOpenProfileModal(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            p: 0.5,
            pl: 2,
            pr: 1,
            borderRadius: "12px",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Box
            sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "#462b2b", lineHeight: 1.2 }}
            >
              {user ? user.name : "User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#462b2b",
                display: "block",
                lineHeight: 1.2,
              }}
            >
              {user ? user.role : "Role"}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: "#462b2b",
              color: "#ffffff",
              width: ismobile ? 32 : 40,
              height: ismobile ? 32 : 40,
              fontSize: "1rem",
            }}
          >
            {user?.name?.charAt(0) || "U"}
          </Avatar>
        </Box>

        <Box sx={{ ml: { xs: -0.5, sm: 1 } }}>
          <IconButton
            onClick={handleLogoutClick}
            sx={{
              color: "#462b2b",
              "&:hover": { bgcolor: "#f1e7dc" },
              borderRadius: "8px",
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
            borderRadius: "12px",
            width: "100%",
            maxWidth: "400px",
            p: 1,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            pb: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              p: 1.5,
              borderRadius: "50%",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogoutIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 1, color: "#101828" }}
          >
            Logout Confirmation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to logout?
          </Typography>
        </Box>

        <Box
          sx={{
            p: 3,
            pt: 3,
            display: "flex",
            gap: 1.5,
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: "8px",
              color: "#344054",
              borderColor: "#D0D5DD",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#D0D5DD", bgcolor: "#F9FAFB" },
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
              borderRadius: "8px",
              bgcolor: "#3D52A0",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#2A3B75" },
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
