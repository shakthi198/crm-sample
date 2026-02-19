import React, { useCallback, useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Storefront,
  LocalPhone,
  Map,
  Info,
  Close as CloseIcon,
} from "@mui/icons-material";
import PageContainer from "../components/PageContainer";

const emptyFormData = {
  company_name: "",
  email: "",
  phone_number: "",
  physical_address: "",
  status: "Active",
};

const extractFirstJsonObject = (text) => {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;

    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  return null;
};

const readJsonSafely = async (res) => {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const firstJson = extractFirstJsonObject(text);
    if (!firstJson) return null;
    try {
      return JSON.parse(firstJson);
    } catch {
      return null;
    }
  }
};

const normalizeToken = (rawToken) => {
  if (!rawToken) return "";

  let token = String(rawToken).trim();

  // Handle localStorage values stored as JSON: {"token":"..."} or {"access_token":"..."}
  if (token.startsWith("{") && token.endsWith("}")) {
    try {
      const parsed = JSON.parse(token);
      token = parsed?.token || parsed?.access_token || parsed?.jwt || "";
    } catch {
      return "";
    }
  }

  token = String(token).trim();
  token = token.replace(/^['"]+|['"]+$/g, "").trim();

  // Handle repeated/malformed bearer prefixes like:
  // "Bearer <jwt>", "'Bearer <jwt>'", or "Bearer Bearer <jwt>"
  while (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, "").trim();
  }

  if (!token || token === "null" || token === "undefined") return "";
  return token;
};

const Organization = () => {
  const fallbackToken =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NzA4MDM4NDYsIm9yZ2FuaXphdGlvbl9ndWlkIjoiNDljNGMxMjItMDcxOC0xMWYxLTljNDItZTIxYWQ4ZjAyYjA0IiwiYWRtaW5fZ3VpZCI6IjQ5YzRjMWM2LTA3MTgtMTFmMS05YzQyLWUyMWFkOGYwMmIwNCIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW4iLCJpc19hY3RpdmUiOjF9.haZqmTOMh4bBXS-3AhsCGxtfAqmTAm_pZqeA14o2izc";
  const token = localStorage.getItem("token") || fallbackToken;
  const normalizedToken = normalizeToken(token);
  const authToken =
    normalizedToken.split(".").length === 3
      ? normalizedToken
      : normalizeToken(fallbackToken);
  const organizationsApiUrl =
    "http://localhost/crm/organizations.php";

  const [organizations, setOrganizations] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [errors, setErrors] = useState({});

  const getAuthHeaders = useCallback(() => {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  }, [authToken]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await fetch(organizationsApiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await readJsonSafely(res);
      if (!res.ok) {
        if (res.status === 401) {
          console.warn("Unauthorized. Token invalid or expired.", data);
        }
        setOrganizations([]);
        return;
      }
      if (data?.success && Array.isArray(data.data)) {
        setOrganizations(data.data);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Failed to fetch organizations", error);
    }
  }, [organizationsApiUrl, authToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrganizations();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrganizations]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = "Required";
    if (!formData.email.trim()) newErrors.email = "Required";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Required";
    if (!formData.physical_address.trim())
      newErrors.physical_address = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOpen = () => {
    setFormData(emptyFormData);
    setErrors({});
    setAddOpen(true);
  };

  const handleView = (org) => {
    setCurrentOrg(org);
    setViewOpen(true);
  };

  const handleEdit = (org) => {
    setCurrentOrg(org);
    setFormData({
      organization_guid: org.organization_guid,
      company_name: org.company_name || "",
      email: org.email || "",
      phone_number: org.phone_number || "",
      physical_address: org.physical_address || "",
      status: org.status || "Active",
    });
    setErrors({});
    setEditOpen(true);
  };

  const handleDelete = async (guid) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this organization?",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(organizationsApiUrl, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ organization_guid: guid, token: authToken }),
      });
      const data = await readJsonSafely(res);
      if (!res.ok) {
        console.warn("Delete failed", res.status, data);
        return;
      }
      fetchOrganizations();
    } catch (error) {
      console.error("Failed to delete organization", error);
    }
  };

  const handleSaveAdd = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch(organizationsApiUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...formData, token: authToken }),
      });

      const data = await readJsonSafely(res);
      if (!res.ok) {
        console.warn("Create failed", res.status, data);
        return;
      }
      if (data?.success) {
        fetchOrganizations();
        setAddOpen(false);
      }
    } catch (error) {
      console.error("Failed to create organization", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) return;

    try {
      const res = await fetch(organizationsApiUrl, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...formData, token: authToken }),
      });

      const data = await readJsonSafely(res);
      if (!res.ok) {
        console.warn("Update failed", res.status, data);
        return;
      }
      if (data?.success) {
        fetchOrganizations();
        setEditOpen(false);
      }
    } catch (error) {
      console.error("Failed to update organization", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const closeFormModal = () => {
    setAddOpen(false);
    setEditOpen(false);
  };

  return (
    <PageContainer
      title="Organizations"
      subtitle="Manage and monitor your organizations."
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
          sx={{ px: 3, py: 1.25, borderRadius: 1.5, fontWeight: 700 }}
        >
          Add Organization
        </Button>
      }
    >
      <Box sx={{ maxWidth: 1600, margin: "0 auto" }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 1,
            overflow: "auto",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell>Company Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.organization_guid || org.id} hover>
                  <TableCell>{org.company_name}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>{org.phone_number}</TableCell>
                  <TableCell>
                    <Chip label={org.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => handleView(org)}
                        sx={{
                          color: "primary.main",
                          "&:hover": { bgcolor: "#eff6ff" },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(org)}
                        sx={{
                          color: "#f59e0b",
                          "&:hover": { bgcolor: "#fef3c7" },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(org.organization_guid)}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { bgcolor: "#fee2e2" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={addOpen || editOpen}
          onClose={closeFormModal}
          scroll="paper"
          maxWidth={false}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              width: "100%",
              maxWidth: "820px",
              m: 2,
            },
          }}
        >
          <DialogTitle
            component="div"
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#fff",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#1e293b",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {addOpen ? "Add Organization" : "Edit Organization"}
            </Typography>
            <IconButton
              size="small"
              onClick={closeFormModal}
              sx={{ color: "#64748b" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 4, bgcolor: "#f8fafc" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 2.5,
                alignItems: "stretch",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Storefront sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Company Name
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Enter Company Name"
                  value={formData.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  error={!!errors.company_name}
                  helperText={errors.company_name}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <EmailIcon sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Email
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <LocalPhone sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Phone Number
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Enter Phone Number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                />
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Info sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Status
                  </Typography>
                </Box>
                <TextField
                  select
                  fullWidth
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  gridColumn: { xs: "1", md: "1 / 3" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Map sx={{ fontSize: 18, color: "#64748b" }} />
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Physical Address
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Enter Address"
                  value={formData.physical_address}
                  onChange={(e) =>
                    handleInputChange("physical_address", e.target.value)
                  }
                  error={!!errors.physical_address}
                  helperText={errors.physical_address}
                />
              </Paper>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              gap: 2,
              bgcolor: "#fff",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <Button
              variant="outlined"
              onClick={closeFormModal}
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: "8px",
                color: "#64748b",
                borderColor: "#cbd5e1",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#f1f5f9", borderColor: "#94a3b8" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={addOpen ? handleSaveAdd : handleSaveEdit}
              variant="contained"
              disableElevation
              sx={{
                px: 5,
                py: 1.25,
                borderRadius: "8px",
                bgcolor: "#3D52A0",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "#2a3b75" },
              }}
            >
              {addOpen ? "Add Organization" : "Edit Organization"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 2, width: "100%", maxWidth: 740 } }}
        >
          <DialogTitle
            component="div"
            sx={{
              p: 3,
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  color: "primary.main",
                  display: "block",
                  letterSpacing: "0.08em",
                }}
              >
                Organization Profile
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, fontSize: "2.1rem" }}
              >
                {currentOrg?.company_name}
              </Typography>
            </Box>
            <IconButton onClick={() => setViewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {currentOrg && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "1.15rem" }}
                  >
                    {currentOrg.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Phone
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "1.15rem" }}
                  >
                    {currentOrg.phone_number}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "1.15rem" }}
                  >
                    {currentOrg.status}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#64748b",
                      textTransform: "uppercase",
                    }}
                  >
                    Physical Address
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, fontSize: "1.15rem" }}
                  >
                    {currentOrg.physical_address}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setViewOpen(false)}
              fullWidth
              variant="contained"
              color="inherit"
              sx={{
                py: 1.5,
                borderRadius: 1,
                bgcolor: "#1e293b",
                color: "white",
                fontSize: "1.05rem",
                fontWeight: 700,
                "&:hover": { bgcolor: "#0f172a" },
              }}
            >
              Close Profile
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default Organization;
