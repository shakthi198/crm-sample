import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    // 🔵 Primary (Header + Main Brand)
    primary: {
      main: "#3D52A0",
      light: "#7091E6",
      dark: "#2F3E80",
      contrastText: "#ffffff",
    },

    // 🟣 Soft Supporting Accent
    secondary: {
      main: "#8697C4",
    },

    // 🟢 Success
    success: {
      main: "#4F7A57",
    },

    // 🟠 Warning
    warning: {
      main: "#C98B4F",
    },

    // 🔴 Error
    error: {
      main: "#B85042",
    },

    // 🌸 Background
    background: {
      default: "#EDE8F5",   // Full dashboard background
      paper: "#FFFFFF",
    },

    text: {
      primary: "#000000",   // As you asked
      secondary: "#4A4A4A",
    },

    divider: "#D6D1F2",

    sidebar: {
      background: "#EDE8F5",
      activeBg: "#7091E6",
      activeText: "#ffffff",
    },

    charts: {
      primary: "#3D52A0",
      secondary: "#7091E6",
      accent: "#8697C4",
      success: "#4F7A57",
      warning: "#C98B4F",
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: '"Montserrat", system-ui, sans-serif',

    h4: { fontWeight: 700, color: "#000000" },
    h6: { fontWeight: 600, color: "#000000" },

    subtitle1: { color: "#4A4A4A" },
    body1: { color: "#000000" },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#EDE8F5",
        },
      },
    },

    // 🔵 Header
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#EDE8F5",   // ✅ same as background
          color: "#0F172A",
          borderBottom: "1px solid #D6D1E6",  // soft divider for this tone
          boxShadow: "none",
        },
      },
    },


    // 🌸 Sidebar
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#EDE8F5",
          borderRight: "1px solid #D6D1F2",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "6px 12px",
          padding: "10px 16px",
          color: "#000000",

          "&:hover": {
            backgroundColor: "#DAD4F3",
          },

          "&.Mui-selected": {
            backgroundColor: "#7091E6",
            color: "#ffffff",

            "& .MuiListItemIcon-root": {
              color: "#ffffff",
            },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "#3D52A0",
          minWidth: 36,
        },
      },
    },

    // 🔘 Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          boxShadow: "none",
        },

        containedPrimary: {
          backgroundColor: "#7091E6",
          "&:hover": {
            backgroundColor: "#3D52A0",
          },
        },
      },
    },

    // 📦 Cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          border: "1px solid #D6D1F2",
        },
      },
    },

    // 📊 Tables
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#F4F1FB",
          color: "#4A4A4A",
          fontWeight: 600,
          fontSize: "0.75rem",
          borderBottom: "1px solid #D6D1F2",
        },
        root: {
          borderBottom: "1px solid #E6E2F8",
        },
      },
    },
  },
});

export default theme;
