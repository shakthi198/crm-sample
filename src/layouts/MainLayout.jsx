import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const DRAWER_WIDTH = 240;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100dvh",
        background: "#E6D8C9",
        overflowX: "hidden",
      }}
    >
      <CssBaseline />

      <Navbar handleDrawerToggle={handleDrawerToggle} />

      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        isOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* ✅ Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100dvh",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1.5, sm: 2 },
          pt: { xs: 9, sm: 10, md: 12 },
          ml: { md: `${DRAWER_WIDTH}px` },
          width: { xs: "100%", md: `calc(100% - ${DRAWER_WIDTH}px)` },
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
