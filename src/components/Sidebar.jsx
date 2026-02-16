import React, { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, useMediaQuery, Typography, Collapse } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240; // Standard consolidated width

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
    { text: 'Followups', icon: <AssignmentIcon />, path: '/followups' },
    { text: 'Budgets', icon: <MonetizationOnIcon />, path: '/budgets' },
    { text: 'Clients', icon: <BusinessIcon />, path: '/clients' },
    { text: 'Organization', icon: <BusinessIcon />, path: '/organization' },
    {
        text: 'Roles & Permissions',
        icon: <SecurityIcon />,
        children: [
            { text: 'Users', path: '/users' },
            { text: 'Roles', path: '/roles' }
        ]
    }
];

const Sidebar = ({ isOpen, handleDrawerToggle }) => {
    const location = useLocation();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const ismobile = useMediaQuery(theme.breakpoints.up('xs'));

    // State for collapsible menus
    const [openSubmenu, setOpenSubmenu] = useState({});

    // Auto-expand menu if on a child route
    useEffect(() => {
        const newOpenState = { ...openSubmenu };
        menuItems.forEach(item => {
            if (item.children) {
                const isChildActive = item.children.some(child => location.pathname.startsWith(child.path));
                if (isChildActive) {
                    newOpenState[item.text] = true;
                }
            }
        });
        setOpenSubmenu(newOpenState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleSubmenuClick = (text) => {
        setOpenSubmenu((prev) => ({ ...prev, [text]: !prev[text] }));
    };

    const renderMenuItem = (item) => {
        const isParent = !!item.children;
        const isOpen = openSubmenu[item.text] || false;

        // Active state logic
        let isActive = false;
        if (isParent) {
            // Parent is active if any child is active (handled by auto-expand mostly, but strictly speaking parent doesn't navigate)
            // We usually don't highlight the parent as "active" in the same way, but we can if desired.
            // Requirement says: "Roles & Permissions parent must remain expanded" - handled by state.
            // "Active child item must show highlight" - handled by child rendering.
        } else {
            isActive = location.pathname.startsWith(item.path);
        }

        return (
            <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        component={isParent ? 'div' : Link}
                        to={isParent ? undefined : item.path}
                        onClick={isParent ? () => handleSubmenuClick(item.text) : (!isDesktop ? handleDrawerToggle : undefined)}
                        selected={isActive}
                        sx={{
                            borderRadius: '12px',
                            px: 2,
                            py: 1.5,
                            mb: 0.5,
                            transition: 'all 0.2s ease-in-out',
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.sidebar.activeBg,
                                color: theme.palette.sidebar.activeText,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.sidebar.activeBg, 0.8),
                                },
                            },
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.text.primary, 0.04),
                                color: theme.palette.text.primary,
                            },
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 42,
                            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                            transition: 'color 0.2s',
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.4rem'
                            }
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.95rem',
                            }}
                        />
                        {isParent && (isOpen ? <ExpandLess sx={{ color: 'text.secondary' }} /> : <ExpandMore sx={{ color: 'text.secondary' }} />)}
                    </ListItemButton>
                </ListItem>

                {isParent && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item.children.map((child) => {
                                const isChildActive = location.pathname.startsWith(child.path);
                                return (
                                    <ListItem key={child.text} disablePadding>
                                        <ListItemButton
                                            component={Link}
                                            to={child.path}
                                            onClick={!isDesktop ? handleDrawerToggle : undefined}
                                            selected={isChildActive}
                                            sx={{
                                                borderRadius: '12px',
                                                pl: 4, // Indentation
                                                pr: 2,
                                                py: 1, // Smaller spacing
                                                mb: 0.5,
                                                transition: 'all 0.2s ease-in-out',
                                                '&.Mui-selected': {
                                                    backgroundColor: alpha('#3D52A0', 0.1), // specific theme highlight for child
                                                    color: '#3D52A0',
                                                    '&:hover': {
                                                        backgroundColor: alpha('#3D52A0', 0.15),
                                                    },
                                                },
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                                                    color: theme.palette.text.primary,
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={child.text}
                                                primaryTypographyProps={{
                                                    fontWeight: isChildActive ? 600 : 500,
                                                    fontSize: '0.9rem', // Slightly smaller font
                                                    fontFamily: 'Montserrat', // Ensure font family inheritance or explicit
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    const drawerContent = (
        <Box sx={{
            height: '100%',
            backgroundColor: theme.palette.background.default,
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'divider',
        }}>
            {/* Sidebar Branding / Logo */}
            <Box sx={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                px: 3,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: 'primary.main',
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'common.white',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    C
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
                    CRM SYSTEM
                </Typography>
            </Box>

            {/* Navigation Items */}
            <Box sx={{
                overflowY: 'auto',
                overflowX: 'hidden',
                py: 3,
                px: 2,
                flexGrow: 1,
                // Fix for layout shift when scrollbar appears
                scrollbarGutter: 'stable',
                // Custom thin scrollbar for professional look
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(theme.palette.text.secondary, 0.1),
                    borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: alpha(theme.palette.text.secondary, 0.3),
                }
            }}>
                <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {menuItems.map((item) => renderMenuItem(item))}
                </List>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={isOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none',
                        boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer (Permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        boxShadow: 'none',
                        backgroundColor: 'background.paper'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
