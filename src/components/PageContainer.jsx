import React from 'react';
import { Box, Typography, Fade } from '@mui/material';

const PageContainer = ({ title, subtitle, action, children }) => {
    return (
        <Fade in={true} timeout={500}>
            <Box sx={{ width: '100%', p: { xs: 2, md: 4, lg: 5 } }}>
                {/* Header Section */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 5
                    }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="subtitle1">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {action && (
                        <Box>
                            {action}
                        </Box>
                    )}
                </Box>

                {/* Content Section */}
                <Box>
                    {children}
                </Box>
            </Box>
        </Fade>
    );
};

export default PageContainer;
