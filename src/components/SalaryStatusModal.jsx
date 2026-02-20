import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Typography,
    Box,
    Chip,
    IconButton
} from '@mui/material';
import { Close as CloseIcon, Update as UpdateIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const SalaryStatusModal = ({ open, onClose, onUpdateStatus, employees = [] }) => {
    const theme = useTheme();

    // Employees passed from parent

    const [selected, setSelected] = useState([]);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = employees.map((n) => n.guid || n.employee_guid);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleBulkUpdate = (newStatus) => {
        if (selected.length === 0) return;
        onUpdateStatus(selected, newStatus);
        onClose();
        setSelected([]);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h5"
            component="div"
            fontWeight={700}
            sx={{ fontFamily: "Montserrat", color: "#0f172a" }}
          >
            Update Salary Status
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ bgcolor: "action.hover" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 4, bgcolor: "#f8f9fc" }}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              overflow: "hidden",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={
                          selected.length > 0 &&
                          selected.length < employees.length
                        }
                        checked={
                          employees.length > 0 &&
                          selected.length === employees.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      Employee Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Total Salary
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Advance
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Balance
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      Current Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((row) => {
                    const rowId = row.guid || row.employee_guid;
                    const isItemSelected = isSelected(rowId);
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, rowId)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={rowId}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleClick(event, rowId);
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {row.employee_name || row.name || "N/A"}
                        </TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell align="right">₹{row.totalSalary}</TableCell>
                        <TableCell align="right" sx={{ color: "error.main" }}>
                          -₹{row.advanceTaken}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, color: "primary.main" }}
                        >
                          ₹{row.balance}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={row.status}
                            size="small"
                            color={
                              row.status === "Paid" ? "success" : "default"
                            }
                            variant={
                              row.status === "Paid" ? "filled" : "outlined"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              Selected: {selected.length} employees
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            px: 4,
            borderTop: "1px solid",
            borderColor: "divider",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 0 },
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: "8px",
              height: 40, // Slightly smaller height
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }} />
          <Button
            variant="outlined"
            color="error"
            disabled={selected.length === 0}
            onClick={() => handleBulkUpdate("Unpaid")}
            sx={{
              borderRadius: "8px",
              height: 40,
              width: { xs: "100%", sm: "auto" },
              mr: { xs: 0, sm: 1 },
              mb: { xs: 0, sm: 0 },
            }}
          >
            Mark as Unpaid
          </Button>
          <Button
            variant="contained"
            disabled={selected.length === 0}
            onClick={() => handleBulkUpdate("Paid")}
            startIcon={<UpdateIcon />}
            sx={{
              borderRadius: "8px",
              height: 40,
              width: { xs: "100%", sm: "auto" },
              bgcolor: theme.palette.primary.main,
              '&.Mui-disabled': {
                bgcolor: '#8b6f47',
                color: '#fff',
                opacity: 0.7,
                cursor: 'not-allowed'
              }
            }}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    );
};

export default SalaryStatusModal;
