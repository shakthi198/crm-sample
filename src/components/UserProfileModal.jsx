import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Avatar,
    Grid,
    IconButton,
    TextField,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';

const UserProfileModal = ({ open, onClose, user }) => {
    const theme = useTheme();
    const { updateProfile } = useAuth();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Initialize form data when user changes or modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user, open]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        // Basic validation
        if (!formData.name.trim() || !formData.email.trim()) return;

        const success = updateProfile(formData);
        if (success) {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    };

    if (!user) return null;

    // Derived/Mock data for read-only fields
    const userDetails = {
        role: user.role || 'Super Admin',
        organization: user.organization || 'CRM System',
        username: (user.name || 'user').toLowerCase().replace(/\s/g, ''),
        createdDate: 'Jan 15, 2024',
        lastLogin: 'Today, 10:30 AM'
    };

    const DetailItem = ({ icon, label, value, name, isEditable }) => (
        <Box sx={{
            display: 'flex',
            alignItems: 'center', // Vertically center content
            gap: 2,
            p: 2.5, // Increase padding
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px', // Rounded corners
            bgcolor: 'background.paper',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)', // Subtle shadow
            height: '100%', // Full height for equal sizing
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: '0 4px 12px rgba(61, 82, 160, 0.08)'
            }
        }}>
            <Box sx={{
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                p: 1.5, // Larger icon background
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 48, // Fixed width for alignment
                height: 48
            }}>
                {React.cloneElement(icon, { fontSize: 'medium' })}
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>

                {isEditing && isEditable ? (
                    <TextField
                        fullWidth
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        variant="standard" // Use standard to blend better or outlined
                        placeholder={label}
                        InputProps={{ disableUnderline: true }} // Custom styling if needed, or keep outlined
                        sx={{
                            '& .MuiInputBase-root': {
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                p: 0
                            }
                        }}
                    />
                ) : (
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 700, fontSize: '0.95rem' }} noWrap>
                        {value}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md" // Increased max width
            fullWidth
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '820px', // Specific wider width
                    borderRadius: '16px', // More rounded
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)', // Deeper shadow
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 4,
                py: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Montserrat' }}>
                    {isEditing ? 'Edit Profile' : 'User Profile'}
                </Typography>
                <IconButton onClick={onClose} size="small" disabled={isEditing} sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0, border: 'none' }}>
                {/* Header Section */}
                <Box sx={{
                    bgcolor: 'background.paper', // Keep white or use theme color? Request said "Keep content area white", but Header existing was theme color. 
                    // Let's stick to the existing header style but larger.
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    p: 5, // Increased padding
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                }}>
                    <Avatar
                        sx={{
                            width: 100, // Larger Avatar
                            height: 100,
                            bgcolor: 'white',
                            color: theme.palette.primary.main,
                            fontSize: '3rem',
                            fontWeight: 800,
                            border: '4px solid rgba(255,255,255,0.3)',
                            mb: 2,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                        }}
                    >
                        {formData.name.charAt(0) || (user.name ? user.name.charAt(0) : 'U')}
                    </Avatar>

                    {isEditing ? (
                        <TextField
                            value={formData.name}
                            name="name"
                            onChange={handleChange}
                            variant="standard"
                            placeholder="Your Name"
                            inputProps={{
                                style: {
                                    textAlign: 'center',
                                    color: 'white',
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    fontFamily: 'Montserrat'
                                }
                            }}
                            sx={{
                                mb: 1,
                                width: '50%',
                                '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255,255,255,0.5)' },
                                '& .MuiInput-underline:after': { borderBottomColor: 'white' },
                            }}
                        />
                    ) : (
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontFamily: 'Montserrat' }}>
                            {formData.name}
                        </Typography>
                    )}

                    <Box sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        px: 3,
                        py: 0.8,
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mt: 1
                    }}>
                        <VerifiedUserIcon sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle1" fontWeight={600} sx={{ letterSpacing: '0.02em' }}>
                            {userDetails.role}
                        </Typography>
                    </Box>
                </Box>

                {/* Details Grid */}
                <Box sx={{ p: 5, bgcolor: '#f8f9fc' }}> {/* Light background for contrast with white cards */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // 1 column mobile, 2 columns desktop
                        gap: 3, // Spacing between cards
                    }}>
                        {/* Row 1 */}
                        <DetailItem
                            icon={<EmailIcon />}
                            label="Email Address"
                            value={formData.email}
                            name="email"
                            isEditable={true}
                        />
                        <DetailItem
                            icon={<PhoneIcon />}
                            label="Phone Number"
                            value={formData.phone || '+91 98765 43210'}
                            name="phone"
                            isEditable={true}
                        />

                        {/* Row 2 */}
                        <DetailItem
                            icon={<BusinessIcon />}
                            label="Organization"
                            value={userDetails.organization}
                            isEditable={false}
                        />
                        <DetailItem
                            icon={<PersonIcon />}
                            label="Username"
                            value={userDetails.username}
                            isEditable={false}
                        />

                        {/* Row 3 */}
                        <DetailItem
                            icon={<CalendarTodayIcon />}
                            label="Joined Date"
                            value={userDetails.createdDate}
                            isEditable={false}
                        />
                        <DetailItem
                            icon={<AccessTimeIcon />}
                            label="Last Login"
                            value={userDetails.lastLogin}
                            isEditable={false}
                        />
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, px: 5, gap: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                {isEditing ? (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            color="inherit"
                            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, py: 1, borderColor: 'divider' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disableElevation
                            sx={{
                                borderRadius: '8px',
                                px: 4,
                                py: 1,
                                bgcolor: theme.palette.primary.main,
                                textTransform: 'none',
                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                fontFamily: 'Montserrat',
                                fontWeight: 600
                            }}
                        >
                            Save Changes
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setIsEditing(true)}
                            sx={{ borderRadius: '8px', textTransform: 'none', px: 3, py: 1, color: theme.palette.primary.main, borderColor: alpha(theme.palette.primary.main, 0.5) }}
                        >
                            Edit Profile
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="contained"
                            disableElevation
                            sx={{
                                borderRadius: '8px',
                                px: 4,
                                py: 1,
                                bgcolor: theme.palette.primary.main,
                                textTransform: 'none',
                                '&:hover': { bgcolor: theme.palette.primary.dark },
                                fontFamily: 'Montserrat',
                                fontWeight: 600
                            }}
                        >
                            Close
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default UserProfileModal;
