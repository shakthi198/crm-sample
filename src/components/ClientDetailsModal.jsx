import React from 'react';
import {
    Dialog,
    Typography,
    Box,
    Chip,
    Avatar,
    IconButton,
    Button,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Description as FileIcon,
    Edit as EditIcon
} from '@mui/icons-material';

const ClientDetailsModal = ({ open, onClose, client, onEdit }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!client) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    px: { xs: 2, sm: 4 },
                    py: { xs: 3, sm: 5 },
                    textAlign: "center",
                    position: "relative",
                    m: { xs: 2, sm: 4 }
                }
            }}
        >
            {/* Action Buttons (Edit & Close) */}
            <Box sx={{ position: "absolute", top: 16, right: 16, display: 'flex', gap: 1 }}>
                {onEdit && (
                    <IconButton
                        onClick={onEdit}
                        sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                        size="small"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}
                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: 'grey.100',
                        '&:hover': { bgcolor: 'grey.200' }
                    }}
                    size="small"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Avatar */}
            <Avatar
                sx={{
                    width: { xs: 70, sm: 90 },
                    height: { xs: 70, sm: 90 },
                    bgcolor: "#3D52A0",
                    mx: "auto",
                    mb: 2,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                    fontWeight: 700
                }}
            >
                {client.client_name ? client.client_name.charAt(0).toUpperCase() : 'C'}
            </Avatar>

            {/* Status Chip */}
            <Chip
                label={client.lead_status || 'Active'}
                sx={{
                    bgcolor: client.lead_status === 'Closed Won' ? "#16A34A" : "#3D52A0",
                    color: "#fff",
                    fontWeight: 600,
                    mb: 2
                }}
            />

            {/* Client Name */}
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                {client.client_name}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {client.company}
            </Typography>

            <Divider sx={{ mb: 4 }} />

            {/* Info Row - Stack on mobile, Row on desktop */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: "space-between",
                    textAlign: { xs: 'center', sm: 'left' },
                    gap: { xs: 3, sm: 0 },
                    mb: 4
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        EMAIL
                    </Typography>
                    <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                        {client.email}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary">
                        PHONE
                    </Typography>
                    <Typography fontWeight={600}>
                        {client.phone}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="caption" color="text.secondary">
                        START DATE
                    </Typography>
                    <Typography fontWeight={600}>
                        {client.start_date}
                    </Typography>
                </Box>
            </Box>

            {/* Document Section */}
            <Box textAlign="left">
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                >
                    REFERENCE DOCUMENT
                </Typography>

                <Box
                    sx={{
                        mt: 2,
                        border: "1px solid #E2E8F0",
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: '100%' }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: "#FEE2E2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0
                            }}
                        >
                            <FileIcon sx={{ color: "#DC2626" }} />
                        </Box>

                        <Box sx={{ overflow: 'hidden' }}>
                            <Typography fontWeight={600} noWrap>
                                {client.contract_file || 'No file attached'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Contract File
                            </Typography>
                        </Box>
                    </Box>

                    {client.contract_file && (
                        <Button
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Download
                        </Button>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
};

export default ClientDetailsModal;
