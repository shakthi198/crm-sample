import React from 'react';
import { Paper, Box } from '@mui/material';

const DataTableCard = ({ children }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '16px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(241, 245, 249, 0.5)',
            }}
        >
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                {children}
            </Box>
        </Paper>
    );
};

export default DataTableCard;
