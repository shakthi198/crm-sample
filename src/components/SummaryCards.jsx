import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useMediaQuery, useTheme } from '@mui/material';

const SummaryCards = ({ items }) => {
    const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    return (
        <Grid container spacing={3} sx={{ mb: 4 }} width={"100%"}>
            {items.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index} width={ismobile ? "100%" : isTablet ? "45%" : "23.5%"}>
                    <Card
                        elevation={0}
                        sx={{
                            height: '100%',
                            borderRadius: '16px',
                            backgroundColor: 'background.paper',
                            boxShadow: theme.shadows[1], // Use theme shadow
                            transition: 'all 0.3s ease',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[4],
                            }
                        }}
                    >
                        <CardContent sx={{ p: '24px !important', display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px', // Slightly more rounded icon bg
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: card.bgColor || `${card.color}15`, // More transparent
                                    color: card.color,
                                    mr: 2.5,
                                    flexShrink: 0
                                }}
                            >
                                {card.icon}
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                                    {card.title}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.75rem', lineHeight: 1.2 }}>
                                    {card.value}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default SummaryCards;
