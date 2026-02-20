import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const SummaryCards = ({ items, showChart = false }) => {
  const theme = useTheme();
    const ismobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Grid container spacing={3} sx={{ mb: 4, width: "100%" }}>
      {items.map((item, index) => (
        <Grid
          key={index}
          item
          xs={12}
          sm={6}
          width={{ xs: "100%", sm: "48%",lg:"23%" }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",
              //   minHeight: showChart ? 180 : 176,
              borderRadius: "16px",
              backgroundColor: "background.paper",
              boxShadow: theme.shadows[1],
              transition: "all 0.3s ease",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent
              sx={{
                p: "24px !important",
                display: "flex",
                alignItems: "center",
              }}
            >
                <Box
                  sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '16px', // Slightly more rounded icon bg
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: item.bgColor || `${item.color}15`, // More transparent
                                    color: item.color,
                                    mr: 2.5,
                                    flexShrink: 0
                                }}
                >
                  {item.icon}
                </Box>

                <Box sx={{ overflow: "hidden", minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#5f7593",
                      fontWeight: 600,
                      fontSize:"0.875rem",
                    //   lineHeight: 1.3,
                    //   whiteSpace: "normal",
                    //   wordBreak: "normal",
                    //   overflowWrap: "normal",
                    }}
                  >
                    {item.title}
                  </Typography>

              <Typography
                variant="h4"
                title={item.value}
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%"
                //   ml: 0,
                //   mt: showChart ? 0 : 0.35,
                //   textAlign: showChart ? "left" : item.valueAlign || "center",
                }}
              >
                {item.value}
              </Typography>
</Box>
              {/* {showChart ? (
                <Box
                  sx={{
                    width: "100%",
                    height: 60,
                    minWidth: 0,
                    borderRadius: 1.5,
                    backgroundColor: item.color,
                    opacity: 0.95,
                  }}
                />
              ) : null} */}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
