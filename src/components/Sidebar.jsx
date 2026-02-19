import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/dashboard",
    module: "Dashboard",
  },
  { text: "Leads", icon: <PeopleIcon />, path: "/leads", module: "Leads" },
  {
    text: "Followups",
    icon: <AssignmentIcon />,
    path: "/followups",
    module: "Followups",
  },
  {
    text: "Budgets",
    icon: <MonetizationOnIcon />,
    path: "/budgets",
    module: "Budgets",
  },
  {
    text: "Clients",
    icon: <BusinessIcon />,
    path: "/clients",
    module: "Clients",
  },
  {
    text: "Organization",
    icon: <BusinessIcon />,
    path: "/organization",
    module: "Organization",
  },

  {
    text: "Roles & Permissions",
    icon: <AdminPanelSettingsIcon />,
    module: "Roles", // parent module
    children: [
      { text: "Users", path: "/users", module: "Users" },
      { text: "Roles", path: "/roles", module: "Roles" },
    ],
  },
];


const Sidebar = ({ drawerWidth, isOpen, handleDrawerToggle }) => {
  const location = useLocation();
const { user } = useAuth();
const hasAccess = (moduleName) => {
  if (!user) return false;

  // Admin & Super Admin → full access
  if (user.role === "Admin" || user.role === "Super Admin") {
    return true;
  }

  if (!user.permissions) return false;

  const permission = user.permissions.find(
    (p) => p.module.toLowerCase() === moduleName.toLowerCase(),
  );

  if (!permission) return false;

  return permission.view === 1 || permission.full_access === 1;
};

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            bgcolor: "#3e2929",
            mr: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "common.white",
            fontWeight: 800,
            fontSize: "1.2rem",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          C
        </Box>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.5px",
          }}
        >
          CRM SYSTEM
        </Typography>
      </Box>

      <List>
        {menuItems.map((item) => {
          // If parent has children
          if (item.children) {
            const visibleChildren = item.children.filter((child) =>
              hasAccess(child.module),
            );

            if (visibleChildren.length === 0) return null;

            return (
              <React.Fragment key={item.text}>
                {/* Parent Title */}
                <ListItem sx={{ mt: 1 }}>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: "#3e2929",
                      textTransform: "uppercase",
                    }}
                  />
                </ListItem>

                {/* Children */}
                {visibleChildren.map((child) => {
                  const isActive = location.pathname.startsWith(child.path);

                  return (
                    <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        to={child.path}
                        onClick={handleDrawerToggle}
                        sx={{
                          borderRadius: 2,
                          pl: 4,
                          backgroundColor: isActive
                            ? "rgba(62,41,41,0.12)"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: "#3e29294c",
                          },
                        }}
                      >
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{
                            fontSize: 13.5,
                            fontWeight: isActive ? 600 : 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </React.Fragment>
            );
          }

          // Normal menu item
          if (!hasAccess(item.module)) return null;

          const isActive = location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive
                    ? "rgba(62,41,41,0.12)"
                    : "transparent",
                  "&:hover": {
                    backgroundColor: "#3e29294c",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#3e2929" }}>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* ✅ Mobile */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: "78vw",
            maxWidth: 320,
            background: "#F7F3EF",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ✅ Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "#E6D8C9",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
