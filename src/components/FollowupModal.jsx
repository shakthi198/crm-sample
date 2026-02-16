import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Box,
    Typography,
    useTheme,
    IconButton
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotesIcon from '@mui/icons-material/Notes';

const FollowupModal = ({ open, onClose, onSave, followup }) => {
    const theme = useTheme();

    // Initial blank state
    const initialState = {
        lead_name: '',
        type: 'Call',
        date: new Date().toISOString().split('T')[0],
        time: '',
        status: 'Pending',
        assigned_to: '',
        outcome: ''
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (followup) {
            setFormData({
                lead_name: followup.lead_name || '',
                type: followup.type || 'Call',
                date: followup.date || '',
                time: followup.time || '',
                status: followup.status || 'Pending',
                assigned_to: followup.assigned_to || '',
                outcome: followup.outcome || ''
            });
        } else if (open) {
            // Reset to default new state when opening fresh
            setFormData(initialState);
        }
    }, [followup, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    // Card wrapper for inputs
    const InputCard = ({ label, icon, children }) => (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            bgcolor: 'background.paper',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: '0 4px 12px rgba(61, 82, 160, 0.08)'
            }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 0.5,
                    borderRadius: '6px'
                }}>
                    {icon}
                </Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '820px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
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
                borderColor: 'divider',
                bgcolor: 'background.paper',
                fontFamily: 'Montserrat',
                fontWeight: 700,
                fontSize: '24px'
            }}>
                {followup ? 'Edit Follow-up' : 'New Follow-up'}
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4, bgcolor: '#f8f9fc' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

                    {/* Row 1 */}
                    <InputCard label="Lead Name" icon={<PersonIcon fontSize="small" />}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            name="lead_name"
                            value={formData.lead_name}
                            onChange={handleChange}
                            placeholder="Enter lead name"
                            size="small"
                        />
                    </InputCard>

                    <InputCard label="Type" icon={<CategoryIcon fontSize="small" />}>
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            size="small"
                        >
                            <MenuItem value="Call">Call</MenuItem>
                            <MenuItem value="Email">Email</MenuItem>
                            <MenuItem value="Meeting">Meeting</MenuItem>
                        </TextField>
                    </InputCard>

                    {/* Row 2 */}
                    <InputCard label="Status" icon={<AssignmentTurnedInIcon fontSize="small" />}>
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            size="small"
                        >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Missed">Missed</MenuItem>
                            <MenuItem value="Scheduled">Scheduled</MenuItem>
                        </TextField>
                    </InputCard>

                    <InputCard label="Assigned To" icon={<AssignmentIndIcon fontSize="small" />}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleChange}
                            placeholder="Assign to user"
                            size="small"
                        />
                    </InputCard>

                    {/* Row 3 */}
                    <InputCard label="Date" icon={<EventIcon fontSize="small" />}>
                        <TextField
                            fullWidth
                            type="date"
                            variant="outlined"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            size="small"
                        />
                    </InputCard>

                    <InputCard label="Time" icon={<AccessTimeIcon fontSize="small" />}>
                        <TextField
                            fullWidth
                            type="time"
                            variant="outlined"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            size="small"
                        />
                    </InputCard>

                    {/* Row 4 - Full Width */}
                    <Box sx={{ gridColumn: { md: '1 / -1' } }}>
                        <InputCard label="Outcome / Notes" icon={<NotesIcon fontSize="small" />}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                name="outcome"
                                value={formData.outcome}
                                onChange={handleChange}
                                placeholder="Enter outcome details or notes..."
                            />
                        </InputCard>
                    </Box>

                </Box>
            </DialogContent>

            <DialogActions sx={{
                p: 2,
                px: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 2
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        borderColor: '#D0D5DD',
                        color: '#344054',
                        height: 44,
                        px: 2.5,
                        fontWeight: 600,
                        fontSize: '14px',
                        '&:hover': {
                            borderColor: '#D0D5DD',
                            bgcolor: 'rgba(52, 64, 84, 0.04)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: '8px',
                        bgcolor: '#3D52A0',
                        textTransform: 'none',
                        fontFamily: 'Montserrat',
                        fontWeight: 600,
                        fontSize: '14px',
                        height: 44,
                        px: 2.5,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: '#334485' }
                    }}
                >
                    Save Follow-up
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FollowupModal;
