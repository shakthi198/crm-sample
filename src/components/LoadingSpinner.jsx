import React from 'react';
import { Box, CircularProgress, Typography, Fade, Backdrop, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PulseBox = styled(Box)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    position: 'absolute',
    animation: `${pulse} 2s infinite ease-in-out`,
    zIndex: 0,
}));

/**
 * Reusable Loading Spinner component with premium animations
 */
const LoadingSpinner = ({
    loading = true,
    mode = 'centered',
    message = '',
    size = 50,
    color = 'primary'
}) => {

    const spinnerContent = (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            position: 'relative',
            zIndex: 1
        }}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PulseBox sx={{ bgcolor: `${color}.main`, opacity: 0.1 }} />

                {/* Secondary Background Ring */}
                <CircularProgress
                    variant="determinate"
                    value={100}
                    size={size}
                    thickness={4}
                    sx={{
                        color: (theme) => theme.palette.grey[200],
                        position: 'absolute',
                    }}
                />

                {/* Primary Spinning Ring */}
                <CircularProgress
                    size={size}
                    color={color}
                    thickness={4}
                    sx={{
                        strokeLinecap: 'round',
                        animationDuration: '750ms',
                    }}
                />
            </Box>

            {message && (
                <Fade in={loading} style={{ transitionDelay: '200ms' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            textAlign: 'center',
                            background: (theme) => `linear-gradient(90deg, ${theme.palette.text.secondary} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.text.secondary} 100%)`,
                            backgroundSize: '200% auto',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: `${shimmer} 3s linear infinite`
                        }}
                    >
                        {message}
                    </Typography>
                </Fade>
            )}
        </Box>
    );

    if (!loading) return null;

    if (mode === 'overlay') {
        return (
            <Backdrop
                open={loading}
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 999,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <Fade in={loading} timeout={400}>
                    {spinnerContent}
                </Fade>
            </Backdrop>
        );
    }

    if (mode === 'centered') {
        return (
            <Fade in={loading} timeout={400}>
                <Box sx={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 5,
                            borderRadius: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 240
                        }}
                    >
                        {spinnerContent}
                    </Paper>
                </Box>
            </Fade>
        );
    }

    return (
        <Fade in={loading} timeout={400}>
            <Box sx={{ display: 'inline-flex', p: 1 }}>
                {spinnerContent}
            </Box>
        </Fade>
    );
};

export default LoadingSpinner;
