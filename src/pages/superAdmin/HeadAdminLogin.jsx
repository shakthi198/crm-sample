import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    Paper,
    useTheme,
    Fade
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
    Visibility,
    VisibilityOff,
    Layers as LogoIcon
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import usersData from '../../data/users.json'
import LoadingSpinner from '../../components/LoadingSpinner'

const HeadAdminLogin = () => {
    const { login } = useAuth()
    const theme = useTheme()
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [keepSignedIn, setKeepSignedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [errors, setErrors] = useState({ username: '', password: '' })

    const validateForm = () => {
        let isValid = true
        const newErrors = { username: '', password: '' }

        if (!username.trim()) {
            newErrors.username = 'Email/Username is required'
            isValid = false
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleInputChange = (setter, field) => (e) => {
        setter(e.target.value)
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
        setErrorMsg('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        setErrorMsg('')

        try {
            await login(username, password, 'HEADADMIN')

            // Check if the user role is correct (Backend returns 'Super Admin')
            const savedUser = JSON.parse(localStorage.getItem('crm_user'));
            if (savedUser && (savedUser.role === 'Super Admin' || savedUser.role === 'Head Admin')) {
                navigate('/super/dashboard')
            } else {
                setErrorMsg('Access Restricted: Super Admin only.')
                setIsLoading(false)
            }
        } catch (error) {
            console.error("Login failed:", error)
            setErrorMsg(error.message || 'Authentication failed.')
            setIsLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3 },
                bgcolor: 'background.default',
                fontFamily: theme.typography.fontFamily
            }}
        >
            <LoadingSpinner loading={isLoading} mode="overlay" message="Verifying credentials..." />
            <Fade in={true} timeout={1000}>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        width: '100%',
                        maxWidth: 1024,
                        minHeight: 640,
                        borderRadius: '24px', // More modern rounded
                        overflow: 'hidden',
                        boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        flexDirection: { xs: 'column', md: 'row' }
                    }}
                >
                    {/* LEFT PANEL */}
                    <Box
                        sx={{
                            flex: 1.2,
                            position: 'relative',
                            color: 'white',
                            p: { xs: 5, md: 8 },
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: { xs: 300, md: 'auto' },
                            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Abstract shapes/effects */}
                        <Box sx={{
                            position: 'absolute',
                            top: -100,
                            right: -100,
                            width: 300,
                            height: 300,
                            borderRadius: '50%',
                            background: alpha('#fff', 0.1),
                            filter: 'blur(50px)'
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            bottom: -50,
                            left: -50,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: alpha('#fff', 0.1),
                            filter: 'blur(40px)'
                        }} />

                        {/* Branding Content */}
                        <Box sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 'auto' }}>
                                <Box
                                    sx={{
                                        p: 1.2,
                                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        backdropFilter: 'blur(12px)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <LogoIcon sx={{ fontSize: 24, color: '#fff' }} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>
                                    CRM Follow-up
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                        mb: 3,
                                        fontSize: { xs: '2.5rem', md: '3.25rem' },
                                        letterSpacing: '-0.03em',
                                        color: '#fff'
                                    }}
                                >
                                    Head Admin<br />Portal
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        opacity: 0.9,
                                        fontSize: '1.1rem',
                                        maxWidth: 440,
                                        lineHeight: 1.6,
                                        color: '#fff'
                                    }}
                                >
                                    Secure access for global system administration.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* RIGHT PANEL */}
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 4, md: 7 },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Box sx={{ width: '100%', maxWidth: 380 }}>
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, letterSpacing: '-0.03em' }}>
                                    Restricted Access
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Head Admin login required.
                                </Typography>
                            </Box>

                            {errorMsg && (
                                <Box
                                    sx={{
                                        p: 1.5,
                                        bgcolor: '#fee2e2',
                                        color: '#b91c1c',
                                        borderRadius: 2,
                                        mb: 3,
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        border: '1px solid #fecaca'
                                    }}
                                >
                                    {errorMsg}
                                </Box>
                            )}

                            <Box component="form" onSubmit={handleLogin} noValidate>
                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        id="username"
                                        label="Email or Username"
                                        variant="outlined"
                                        value={username}
                                        onChange={handleInputChange(setUsername, 'username')}
                                        error={!!errors.username}
                                        helperText={errors.username}
                                        disabled={isLoading}
                                        autoComplete="username"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { borderColor: '#e2e8f0' },
                                                '&:hover fieldset': { borderColor: '#cbd5e1' },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        variant="outlined"
                                        value={password}
                                        onChange={handleInputChange(setPassword, 'password')}
                                        error={!!errors.password}
                                        helperText={errors.password}
                                        disabled={isLoading}
                                        autoComplete="current-password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                bgcolor: '#f8fafc',
                                                '& fieldset': { borderColor: '#e2e8f0' },
                                                '&:hover fieldset': { borderColor: '#cbd5e1' },
                                            },
                                        }}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', // Blue shadow
                                        '&:hover': {
                                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
                                            transform: 'translateY(-1px)'
                                        },
                                    }}
                                >
                                    {isLoading ? 'Verifying...' : 'Authenticate'}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    )
}

export default HeadAdminLogin
