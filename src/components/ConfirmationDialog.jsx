import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    useTheme
} from '@mui/material';

const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", severity = "error" }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    padding: 1,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 700 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    color="inherit"
                    sx={{ borderRadius: '8px' }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={severity}
                    autoFocus
                    sx={{ borderRadius: '8px', boxShadow: 'none' }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
