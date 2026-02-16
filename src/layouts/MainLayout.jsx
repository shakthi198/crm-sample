import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';



const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
            <CssBaseline />

            {/* Top Navbar */}
            <Navbar handleDrawerToggle={handleDrawerToggle} />

            {/* Sidebar Navigation */}
            <Sidebar isOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    overflowX: 'hidden' // Prevent horizontal scroll
                }}
            >
                {/* Spacer to push content below fixed AppBar */}
                <Toolbar />

                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
