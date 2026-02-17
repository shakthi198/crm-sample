import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../context/AuthContext";

const BudgetTable = ({ budgets = [], onEdit, onStatusChange }) => {
  const { hasPermission } = useAuth();
const theme = useTheme();

const getStatusSx = (status) => {
  const colors = {
    Approved: theme.palette.success.main,
    Pending: theme.palette.warning.main,
    Rejected: theme.palette.error.main,
  };

  const color = colors[status] || theme.palette.text.secondary;

  return {
    bgcolor: `${color}15`, // 15% opacity background
    color: color,
    border: `1px solid ${color}30`,
    "&:hover": { bgcolor: `${color}25` },
  };
};
  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table
        sx={{ minWidth: { xs: 800, md: "auto" } }}
        aria-label="budget table"
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "grey.100" }}>
            <TableCell sx={{ fontWeight: 600 }}>Lead Name</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Estimated Amount
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Discount
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Final Amount
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Status
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {budgets.length > 0 ? (
            budgets.map((row) => (
              <TableRow key={row.budget_guid} hover>
                {/* Lead Name */}
                <TableCell>{row.lead_name}</TableCell>

                {/* Estimated */}
                <TableCell align="right">
                  ₹{Number(row.estimated_amount || 0).toLocaleString()}
                </TableCell>

                {/* Discount */}
                <TableCell align="right" sx={{ color: "error.main" }}>
                  {Number(row.discount) > 0
                    ? `-₹${Number(row.discount).toLocaleString()}`
                    : "-"}
                </TableCell>

                {/* Final */}
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  ₹{Number(row.final_amount || 0).toLocaleString()}
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  <Chip
                    label={row.status}
                    size="small"
                    color={
                      row.status === "Approved"
                        ? "success"
                        : row.status === "Pending"
                          ? "warning"
                          : row.status === "Rejected"
                            ? "error"
                            : "default"
                    }
                    sx={{
                      fontWeight: 600,
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      minWidth: "100px",
                      justifyContent: "center",
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {hasPermission("edit_budget") && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          aria-label="Edit budget"
                          onClick={() => onEdit(row)}
                          sx={{
                            width: 30,
                            height: 30,
                            mx: 0.25,
                            bgcolor: "primary.50",
                            "&:hover": { bgcolor: "primary.100" },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {row.status === "Pending" &&
                      hasPermission("approve_budget") && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              aria-label="Approve budget"
                              onClick={() =>
                                onStatusChange(row.budget_guid, "Approved")
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                mx: 0.25,
                                bgcolor: "success.50",
                                "&:hover": { bgcolor: "success.100" },
                              }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Reject budget"
                              onClick={() =>
                                onStatusChange(row.budget_guid, "Rejected")
                              }
                              sx={{
                                width: 30,
                                height: 30,
                                mx: 0.25,
                                bgcolor: "error.50",
                                "&:hover": { bgcolor: "error.100" },
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">
                  No budgets found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BudgetTable;
