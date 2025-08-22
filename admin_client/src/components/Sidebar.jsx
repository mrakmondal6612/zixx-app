import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

import {
  SettingsOutlined,
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  PublicOutlined,
  PointOfSaleOutlined,
  TodayOutlined,
  CalendarMonthOutlined,
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  PieChartOutlined,
} from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import profileImage from "@assets/profile.jpg";

const navItems = [
  {
    text: "Dashboard",
    icon: <HomeOutlined />,
  },

  {
    text: "Client Facing",
    icon: null,
  },
  {
    text: "Products",
    icon: <ShoppingCartOutlined />,
  },
  {
    text: "Customers",
    icon: <Groups2Outlined />,
  },
  {
    text: "Transactions",
    icon: <ReceiptLongOutlined />,
  },
  {
    text: "Geography",
    icon: <PublicOutlined />,
  },
  {
    text: "Sales",
    icon: null,
  },
  {
    text: "Overview",
    icon: <PointOfSaleOutlined />,
  },
  {
    text: "Daily",
    icon: <TodayOutlined />,
  },
  {
    text: "Monthly",
    icon: <CalendarMonthOutlined />,
  },
  {
    text: "Breakdown",
    icon: <PieChartOutlined />,
  },

  {
    text: "Management",
    icon: null,
  },
  {
    text: "Admin",
    icon: <AdminPanelSettingsOutlined />,
  },
  {
    text: "Performance",
    icon: <TrendingUpOutlined />,
  },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // use the public lightweight status endpoint to avoid 401 noise in the UI
  const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8282/api'}/management/sync/public-status`);
        if (res.ok) {
          const json = await res.json();
          setLastSync(json.at || null);
        }
      } catch (e) {
        // ignore network errors
      }
    })();
  }, []);

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);
  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%" display="flex" flexDirection="column" height="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography variant="h4" fontWeight="bold">
                    ZIXX
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <Box flexGrow={1} display="flex" flexDirection="column">
              <List>
                {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2.25rem 0 1rem  3rem" }}>
                      {text}
                    </Typography>
                  );
                }

                const lcText = text.toLowerCase();

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(`/${lcText}`);
                        setActive(lcText);
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === lcText
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === lcText
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === lcText && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
            </Box>
            <Divider sx={{ mt: 2, mb: 1 }} />
            <Box className="sidebar-profile-section" display="flex" flexDirection="column" alignItems="center" mt={1} mx={2} mb={2}>
              <Box display="flex" flexDirection="column" alignItems="center" width="100%">
                <Box
                  component="img"
                  alt="profile"
                  src={profileImage}
                  height="48px"
                  width="48px"
                  borderRadius="50%"
                  sx={{ objectFit: "cover", mb: 0.5 }}
                />
                <Typography fontWeight="bold" fontSize="1rem" sx={{ color: theme.palette.secondary[100], mb: 1 }}>
                  {user && user.name ? user.name : "Admin User"}
                </Typography>
                <Typography fontSize="0.85rem" sx={{ color: theme.palette.secondary[200], mb: 1 }}>
                  {user.occupation}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="row" alignItems="center" justifyContent="center" width="100%" gap={2} mt={1}>
                <IconButton size="small" sx={{ color: theme.palette.secondary[300] }}>
                  <SettingsOutlined sx={{ fontSize: "24px" }} />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ fontWeight: 700, borderRadius: 2, px: 2 }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8282/api'}/management/sync`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
                        credentials: 'include',
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.message);
                      alert(`Sync complete: products ${json.result.products.synced}, users ${json.result.users.synced}`);
                      setLastSync(json.at || new Date().toISOString());
                    } catch (err) {
                      alert('Sync failed: ' + (err.message || err));
                    }
                  }}
                >
                  Sync
                </Button>
              </Box>
              {lastSync && (
                <Typography sx={{ mt: 1, fontSize: '0.75rem', color: theme.palette.secondary[200], textAlign: 'center' }}>
                  Last sync: {new Date(lastSync).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
