import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    InputAdornment,
    Chip,
    Stack,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    LocationOn,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Storefront,
    LocalPhone,
    AssignmentInd,
    CorporateFare,
    Map,
    Info,
    Close as CloseIcon,
} from '@mui/icons-material';
import PageContainer from '../components/PageContainer';

// --- Static Helper Components ---

const SectionHeader = ({ icon, title }) => (
    <Typography
        variant="subtitle2"
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}
    >
        {icon && React.cloneElement(icon, { sx: { fontSize: 18 } })} {title}
    </Typography>
);

const DetailItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', width: '100%' }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f1f5f9', color: '#64748b', display: 'flex' }}>
            {React.cloneElement(icon, { sx: { fontSize: 18 } })}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    lineHeight: 1.4,
                    wordBreak: 'break-word'
                }}
            >
                {value}
            </Typography>
        </Box>
    </Box>
);

const initialBranches = [
    {
        id: 1,
        name: 'Main Headquarters',
        code: 'HQ-01',
        email: 'hq@company.com',
        phone: '+1 234 567 890',
        address: '123 Tech Avenue, Floor 4, San Francisco, CA 94105',
        manager: 'Sarah Johnson',
        orgId: 'ORG-8821',
        status: 'Active',
    },
    {
        id: 2,
        name: 'North Branch',
        code: 'NB-05',
        email: 'north@company.com',
        phone: '+1 234 567 891',
        address: '456 North Plaza, Sector 12, Seattle, WA 98101',
        manager: 'Michael Chen',
        orgId: 'ORG-8821',
        status: 'Active',
    },
];

const managers = ['Sarah Johnson', 'Michael Chen', 'Elena Rodriguez', 'David Wilson', 'James Smith'];

// --- Form Configuration ---
const formSections = [
    {
        title: 'Basic Information',
        icon: <Info />,
        fields: [
            { id: 'name', label: 'Branch Name *', placeholder: 'Branch Name', md: 6, icon: <Storefront /> },
            { id: 'code', label: 'Branch Code *', placeholder: 'Branch Code', md: 6, icon: <AssignmentInd /> },
            { id: 'manager', label: 'Branch Manager *', type: 'select', md: 6, options: managers, icon: <AssignmentInd /> },
            { id: 'orgId', label: 'Organization ID *', placeholder: 'Organization ID', md: 6, icon: <CorporateFare /> },
            { id: 'status', label: 'Status', type: 'select', md: 6, options: ['Active', 'Inactive'], icon: <Info /> },
        ]
    },
    {
        title: 'Contact Details',
        icon: <EmailIcon />,
        fields: [
            { id: 'email', label: 'Email address *', placeholder: 'Email address', md: 6, icon: <EmailIcon /> },
            { id: 'phone', label: 'Phone Number *', placeholder: 'Phone Number', md: 6, icon: <LocalPhone /> },
        ]
    },
    {
        title: 'Location Details',
        icon: <LocationOn />,
        fields: [
            { id: 'address', label: 'Full Physical Address *', placeholder: 'Full Physical Address', md: 12, multiline: true, rows: 3, icon: <Map /> },
        ]
    }
];

const Organization = () => {
    const theme = useTheme();
    const [branches, setBranches] = useState(initialBranches);
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        manager: '',
        orgId: '',
        status: 'Active'
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Required';
        if (!formData.code.trim()) newErrors.code = 'Required';
        if (!formData.email.trim()) newErrors.email = 'Required';
        if (!formData.phone.trim()) newErrors.phone = 'Required';
        if (!formData.address.trim()) newErrors.address = 'Required';
        if (!formData.manager) newErrors.manager = 'Required';
        if (!formData.orgId.trim()) newErrors.orgId = 'Required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddOpen = () => {
        setFormData({ name: '', code: '', email: '', phone: '', address: '', manager: '', orgId: '', status: 'Active' });
        setErrors({});
        setAddOpen(true);
    };

    const handleView = (branch) => {
        setCurrentBranch(branch);
        setViewOpen(true);
    };

    const handleEdit = (branch) => {
        setCurrentBranch(branch);
        setFormData({ ...branch });
        setErrors({});
        setEditOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            setBranches(branches.filter(b => b.id !== id));
        }
    };

    const handleSaveAdd = () => {
        if (validateForm()) {
            setBranches([...branches, { ...formData, id: Date.now() }]);
            setAddOpen(false);
        }
    };

    const handleSaveEdit = () => {
        if (validateForm() && currentBranch) {
            setBranches(branches.map(b => b.id === currentBranch.id ? { ...b, ...formData } : b));
            setEditOpen(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    return (
        <PageContainer
            title="Organization Branches"
            subtitle="Manage and monitor your organization's physical branch locations."
            action={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddOpen}
                    sx={{ px: 3, py: 1.25, borderRadius: 1.5, fontWeight: 700 }}
                >
                    Add Branch
                </Button>
            }
        >
            <Box sx={{ maxWidth: 1600, margin: '0 auto' }}>
                <TableContainer component={Paper} sx={{ borderRadius: 1, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', py: 2.5 }}>Branch Name</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Branch Manager</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {branches.map((branch) => (
                                <TableRow key={branch.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#eff6ff', color: 'primary.main', display: 'flex' }}>
                                                <Storefront sx={{ fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>{branch.name}</Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{branch.code}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{branch.manager}</TableCell>
                                    <TableCell sx={{ color: '#64748b' }}>{branch.email}</TableCell>
                                    <TableCell sx={{ color: '#64748b' }}>{branch.phone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={branch.status}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: branch.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                color: branch.status === 'Active' ? '#166534' : '#991b1b',
                                                borderRadius: 1
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton size="small" onClick={() => handleView(branch)} sx={{ color: 'primary.main', '&:hover': { bgcolor: '#eff6ff' } }}>
                                                <ViewIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEdit(branch)} sx={{ color: '#f59e0b', '&:hover': { bgcolor: '#fef3c7' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(branch.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Form Modal (Add/Edit) */}
                <Dialog
                    open={addOpen || editOpen}
                    onClose={() => { setAddOpen(false); setEditOpen(false); }}
                    scroll="paper"
                    maxWidth={false} // Use custom width
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '820px', // Strict width as requested (720px - 840px range)
                            m: 2
                        }
                    }}
                >
                    <DialogTitle sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        bgcolor: '#fff',
                        borderBottom: '1px solid #e2e8f0'
                    }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', fontFamily: 'Montserrat, sans-serif' }}>
                            {addOpen ? 'Add New Branch' : 'Modify Branch Information'}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => { setAddOpen(false); setEditOpen(false); }}
                            sx={{ color: '#64748b' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 4, bgcolor: '#f8fafc' }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, // Strict 2 columns on desktop
                            gap: 2.5, // 20px
                            alignItems: 'stretch' // Equal height cards
                        }}>
                            {/* 
                            STRICT GRID ARRANGEMENT:
                            Row 1: Branch Name | Branch Code 
                            Row 2: Branch Manager | Organization ID
                            Row 3: Status | Email Address
                            Row 4: Phone Number | Full Physical Address
                        */}

                            {/* Row 1, Col 1: Branch Name */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Storefront sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Branch Name</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Branch Name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                            {/* Row 1, Col 2: Branch Code */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentInd sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Branch Code</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Branch Code"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange('code', e.target.value)}
                                    error={!!errors.code}
                                    helperText={errors.code}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                            {/* Row 2, Col 1: Branch Manager */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <AssignmentInd sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Branch Manager</Typography>
                                </Box>
                                <TextField
                                    select
                                    fullWidth
                                    value={formData.manager}
                                    onChange={(e) => handleInputChange('manager', e.target.value)}
                                    error={!!errors.manager}
                                    helperText={errors.manager}
                                    displayEmpty
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', height: '100% !important', p: '0 14px !important' }
                                    }}
                                >
                                    <MenuItem value="" disabled sx={{ color: 'text.secondary' }}>Select Manager</MenuItem>
                                    {managers.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </TextField>
                            </Paper>

                            {/* Row 2, Col 2: Organization ID */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <CorporateFare sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Organization ID</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Org ID"
                                    value={formData.orgId}
                                    onChange={(e) => handleInputChange('orgId', e.target.value)}
                                    error={!!errors.orgId}
                                    helperText={errors.orgId}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                            {/* Row 3, Col 1: Status */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Info sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Status</Typography>
                                </Box>
                                <TextField
                                    select
                                    fullWidth
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    displayEmpty
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiSelect-select': { display: 'flex', alignItems: 'center', height: '100% !important', p: '0 14px !important' }
                                    }}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </TextField>
                            </Paper>

                            {/* Row 3, Col 2: Email Address */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Email Address</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                            {/* Row 4, Col 1: Phone Number */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <LocalPhone sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Phone Number</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' },
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                            {/* Row 4, Col 2: Physical Address */}
                            <Paper elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <Map sx={{ fontSize: 18, color: '#64748b' }} />
                                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">Physical Address</Typography>
                                </Box>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    error={!!errors.address}
                                    helperText={errors.address}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': { bgcolor: '#fff', borderRadius: '8px', height: '48px' }, // Force match input height
                                        '& .MuiOutlinedInput-input': { height: '48px', p: '0 14px', boxSizing: 'border-box' }
                                    }}
                                />
                            </Paper>

                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 2, gap: 2, bgcolor: '#fff', borderEndStartRadius: 16, borderEndEndRadius: 16, borderTop: '1px solid #e2e8f0' }}>
                        <Button
                            variant="outlined"
                            onClick={() => { setAddOpen(false); setEditOpen(false); }}
                            sx={{
                                px: 4, py: 1.25,
                                borderRadius: '8px',
                                color: '#64748b',
                                borderColor: '#cbd5e1',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={addOpen ? handleSaveAdd : handleSaveEdit}
                            variant="contained"
                            disableElevation
                            sx={{
                                px: 5, py: 1.25,
                                borderRadius: '8px',
                                bgcolor: '#3D52A0',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { bgcolor: '#2a3b75' }
                            }}
                        >
                            {addOpen ? 'Add Branch' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* View Modal */}
                <Dialog
                    open={viewOpen}
                    onClose={() => setViewOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 2 } }}
                >
                    <DialogTitle sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', display: 'block' }}>Branch Profile</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>{currentBranch?.name}</Typography>
                        </Box>
                        <IconButton onClick={() => setViewOpen(false)}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 4 }}>
                        {currentBranch && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <SectionHeader icon={<Info />} title="Core Information" />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem icon={<CorporateFare />} label="Organization ID" value={currentBranch.orgId} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem icon={<AssignmentInd />} label="Manager" value={currentBranch.manager} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem icon={<Storefront />} label="Status" value={currentBranch.status} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}><Divider /></Grid>
                                <Grid item xs={12}>
                                    <SectionHeader icon={<LocationOn />} title="Contact & Location" />
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem icon={<EmailIcon />} label="Email" value={currentBranch.email} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DetailItem icon={<LocalPhone />} label="Phone" value={currentBranch.phone} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <DetailItem icon={<Map />} label="Physical Address" value={currentBranch.address} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setViewOpen(false)} fullWidth variant="contained" color="inherit" sx={{ py: 1.5, borderRadius: 1, bgcolor: '#1e293b', color: 'white', '&:hover': { bgcolor: '#0f172a' } }}>
                            Close Profile
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </PageContainer>
    );
};

export default Organization;
