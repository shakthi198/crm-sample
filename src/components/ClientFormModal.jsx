import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    InputAdornment,
    Typography,
    Box,
    IconButton,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Description as FileIcon,
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Business as BusinessIcon
} from '@mui/icons-material';

const ClientFormModal = ({ open, onClose, onSave, leads, clients, initialData, mode }) => {
    const theme = useTheme();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        lead_id: '',
        contract_file: '',
        start_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (open) {
            if (mode === 'edit' && initialData) {
                setFormData({
                    lead_id: initialData.lead_id,
                    contract_file: initialData.contract_file || 'Financial_Report.pdf',
                    start_date: initialData.start_date
                });
            } else {
                setFormData({
                    lead_id: '',
                    contract_file: '',
                    start_date: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [open, mode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, contract_file: file.name }));
        }
    };

    const handleSubmit = () => {
        if (formData.lead_id && formData.start_date) {
            onSave(formData);
        } else {
            alert('Please select a lead and start date.');
        }
    };

    // Filter available leads logic
    const availableLeads = leads.filter(lead => {
        const isClient = clients.some(c => c.lead_id === lead.id);
        if (mode === 'edit' && initialData) {
            return !isClient || lead.id === initialData.lead_id;
        }
        return !isClient;
    });

    // Card wrapper for inputs
    const InputCard = ({ label, icon, children, onClick, sx }) => (
        <Box
            onClick={onClick}
            sx={{
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
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: '0 4px 12px rgba(61, 82, 160, 0.08)'
                },
                ...sx
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 0.5,
                    borderRadius: '6px'
                }}>
                    {React.cloneElement(icon, { fontSize: 'small' })}
                </Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </Typography>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                    maxWidth: '840px',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
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
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'Montserrat', color: '#0f172a' }}>
                    {mode === 'add' ? 'Add New Client' : 'Edit Client'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 4, bgcolor: '#f8f9fc' }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gridTemplateRows: { md: 'auto' },
                    gap: 3
                }}>

                    {/* Row 1 Col 1: Select Lead */}
                    <InputCard label="Select Lead" icon={<PersonIcon />}>
                        <TextField
                            select
                            fullWidth
                            name="lead_id"
                            value={formData.lead_id}
                            onChange={handleChange}
                            disabled={mode === 'edit'}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                            SelectProps={{
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) return <Typography color="text.secondary">Select lead...</Typography>;
                                    const lead = leads.find(l => l.id === selected);
                                    return lead ? `${lead.client_name}` : selected;
                                }
                            }}
                        >
                            {availableLeads.map((lead) => (
                                <MenuItem key={lead.id} value={lead.id}>
                                    {lead.client_name} - {lead.company}
                                </MenuItem>
                            ))}
                        </TextField>
                    </InputCard>

                    {/* Row 1 Col 2: Contract Start Date */}
                    <InputCard label="Contract Start Date" icon={<CalendarIcon />}>
                        <TextField
                            fullWidth
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ '& .MuiInputBase-root': { height: '48px' } }}
                        />
                    </InputCard>

                    {/* Row 2 Col 1: Upload Contract */}
                    <InputCard
                        label="Upload Contract"
                        icon={<CloudUploadIcon />}
                        onClick={handleFileClick}
                        sx={{
                            '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) }
                        }}
                    >
                        <input
                            type="file"
                            hidden
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, height: '48px', px: 1 }}>
                            <Typography variant="body2" color={formData.contract_file ? 'text.primary' : 'text.secondary'} noWrap>
                                {formData.contract_file || "Click to upload file..."}
                            </Typography>
                            {formData.contract_file && <FileIcon color="primary" fontSize="small" />}
                        </Box>
                    </InputCard>

                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, px: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit" variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', px: 3, height: 44, borderColor: 'divider' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disableElevation
                    sx={{
                        borderRadius: '8px',
                        px: 4,
                        height: 44,
                        bgcolor: theme.palette.primary.main,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                    }}
                >
                    {mode === 'add' ? 'Add Client' : 'Update Client'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClientFormModal;
