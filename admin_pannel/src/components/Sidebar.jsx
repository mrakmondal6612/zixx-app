import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMode } from "@state";

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
  Menu,
  MenuItem,
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
  LocalShippingOutlined,
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import profileImage from "@assets/profile.jpg";
import { getApiBase } from "@utils/apiBase";

const navItems = [
  { text: "Dashboard", icon: <HomeOutlined /> },
  { text: "Client Facing", icon: null },
  { text: "Products", icon: <ShoppingCartOutlined /> },
  { text: "Banners", icon: <ReceiptLongOutlined /> },
  { text: "Testimonials", icon: <ReceiptLongOutlined /> },
  { text: "Customers", icon: <Groups2Outlined /> },
  { text: "Orders", icon: <LocalShippingOutlined /> },
  { text: "Transactions", icon: <ReceiptLongOutlined /> },
  { text: "Geography", icon: <PublicOutlined /> },
  { text: "Sales", icon: null },
  { text: "Overview", icon: <PointOfSaleOutlined /> },
  { text: "Daily", icon: <TodayOutlined /> },
  { text: "Monthly", icon: <CalendarMonthOutlined /> },
  { text: "Breakdown", icon: <PieChartOutlined /> },
  { text: "Management", icon: null },
  { text: "Admin", icon: <AdminPanelSettingsOutlined /> },
  { text: "Performance", icon: <TrendingUpOutlined /> },
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
  const dispatch = useDispatch();
  const [lastSync, setLastSync] = useState(null);
  
  // Settings menu state
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const settingsOpen = Boolean(settingsAnchor);
  const openSettings = (e) => setSettingsAnchor(e.currentTarget);
  const closeSettings = () => setSettingsAnchor(null);

  // Resolve avatar/photo URL for user/admin with robust fallbacks
  const resolveAvatarSrc = () => {
    try {
      const candidates = [
        user && user.profile_pic,
        user && (user.photo || user.avatar || user.image || user.imageUrl || user.profileImage || user.picture || user.profilePic || user.profile_photo || user.photoURL),
        user && user.adminPhoto,
        user && user.userPhoto,
      ].filter(Boolean);

      const apiBase = getApiBase();
      const origin = apiBase.replace(/\/?api\/?$/i, '').replace(/\/$/, '');

      for (const c of candidates) {
        const raw = String(c).trim();
        if (!raw) continue;
        // Skip default/placeholder URLs
        if (raw.includes('example.com') || raw.includes('default-profile-pic')) continue;
        if (/^https?:\/\//i.test(raw)) return raw;
        if (raw.startsWith('/')) return origin + raw;
        return `${origin}/${raw}`;
      }
    } catch (e) {}
    return profileImage;
  };

  useEffect(() => {
    const url = import.meta.env.VITE_ADMIN_SYNC_STATUS_URL;
    if (!url) return; // disabled by default
    (async () => {
      try {
        const res = await fetch(url, { credentials: 'include' });
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
          variant={isNonMobile ? "persistent" : "temporary"}
          anchor="left"
          ModalProps={{ keepMounted: true }}
          sx={{
            width: isNonMobile ? drawerWidth : "85vw",
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: isNonMobile ? drawerWidth : "85vw",
              maxWidth: isNonMobile ? drawerWidth : "320px",
            },
          }}
        >
          <Box
            width="100%"
            display="flex"
            flexDirection="column"
            height="100%"
            sx={{ pt: { xs: 'calc(56px + env(safe-area-inset-top))', sm: '64px' } }}
          >
            {/* HEADER WITH ZIXX */}
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween>
                <Box
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
                    let frontend = import.meta.env.VITE_FRONTEND_URL;
                    if (!frontend) {
                      frontend = isProd ? 'https://zixx.vercel.app' : `http://${window.location.hostname}`;
                    }
                    try { const u = new URL(frontend); frontend = u.origin; } catch (e) {}
                    window.location.href = `${frontend.replace(/\/$/, '')}/`;
                  }}
                >
                  <Typography variant="h3" fontWeight="bold" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }} color={theme.palette.secondary[100]}>
                    ZIXX
                    <br />
                  <Typography className="text-[10px] text-gray-500 justify-center" color={theme.palette.primary[300]}>
                    ( Return Back )
                  </Typography>
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            {/* NAVIGATION ITEMS */}
            <Box flexGrow={1} display="flex" flexDirection="column">
              <List>
                {navItems.map(({ text, icon }) => {
                  if (!icon) {
                    return (
                      <Typography key={text} sx={{ m: "2.25rem 0 1rem 3rem" }}>
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
                          if (!isNonMobile) setIsSidebarOpen(false);
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

            {/* FOOTER PROFILE & SYNC */}
            <Divider sx={{ mt: 2, mb: 1 }} />
            <Box
              className="sidebar-profile-section"
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={1}
              mx={{ xs: 1, sm: 2 }}
              mb={2}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                width="100%"
              >
                <Box
                  component="img"
                  alt="profile"
                  src={resolveAvatarSrc()}
                  height="48px"
                  width="48px"
                  borderRadius="50%"
                  sx={{ objectFit: "cover", mb: 0.5 }}
                  onError={(e) => { try { e.currentTarget.src = profileImage; } catch (_) {} }}
                />
                <Typography
                  fontWeight="bold"
                  fontSize={{ xs: "0.9rem", sm: "1rem" }}
                  sx={{ color: theme.palette.secondary[100], mb: 1, textAlign: "center" }}
                >
                  {user && (user.name || user.first_name) 
                    ? (user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()) 
                    : "Admin User"}
                </Typography>
                <Typography
                  fontSize={{ xs: "0.75rem", sm: "0.85rem" }}
                  sx={{ color: theme.palette.secondary[200], mb: 1, textAlign: "center" }}
                >
                  {user?.occupation || user?.role || "Administrator"}
                </Typography>
              </Box>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                alignItems="center"
                justifyContent="center"
                width="100%"
                gap={{ xs: 1, sm: 2 }}
                mt={1}
              >
                <IconButton
                  size="small"
                  onClick={openSettings}
                  sx={{ 
                    color: theme.palette.secondary[300],
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover,
                      color: theme.palette.primary.main 
                    }
                  }}
                  title="Settings"
                >
                  <SettingsOutlined sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ 
                    fontWeight: 700, 
                    borderRadius: 2, 
                    px: { xs: 1.5, sm: 2 },
                    py: 0.5,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    minWidth: { xs: "80px", sm: "auto" },
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-1px)',
                      boxShadow: theme.shadows[4]
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const trigger = import.meta.env.VITE_ADMIN_SYNC_TRIGGER_URL;
                      if (!trigger) {
                        alert("Sync is not configured. Set VITE_ADMIN_SYNC_TRIGGER_URL in your env.");
                        return;
                      }
                      
                      // Show loading state
                      const button = document.activeElement;
                      const originalText = button.textContent;
                      button.textContent = "Syncing...";
                      button.disabled = true;
                      
                      const res = await fetch(trigger, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                        credentials: "include",
                      });
                      const json = await res.json();
                      
                      button.textContent = originalText;
                      button.disabled = false;
                      
                      if (!res.ok) throw new Error(json.message);
                      const products = json?.result?.products?.synced;
                      const users = json?.result?.users?.synced;
                      if (typeof products === 'number' || typeof users === 'number') {
                        alert(`✅ Sync Complete!\nProducts: ${products ?? 0}\nUsers: ${users ?? 0}`);
                      } else {
                        alert('✅ Sync triggered successfully');
                      }
                      setLastSync(json.at || new Date().toISOString());
                    } catch (err) {
                      const button = document.activeElement;
                      button.textContent = "Sync";
                      button.disabled = false;
                      alert("❌ Sync failed: " + (err.message || err));
                    }
                  }}
                >
                  Sync Data
                </Button>
              </Box>
              {lastSync && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    color: theme.palette.secondary[200],
                    textAlign: "center",
                    px: 1
                  }}
                >
                  Last sync: {new Date(lastSync).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
        </Drawer>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={settingsOpen}
        onClose={closeSettings}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            mt: -1,
            minWidth: 220,
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }
        }}
      >
        <MenuItem 
          onClick={() => { dispatch(setMode()); closeSettings(); }}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          {theme.palette.mode === "dark" ? (
            <LightModeOutlined sx={{ fontSize: "20px" }} />
          ) : (
            <DarkModeOutlined sx={{ fontSize: "20px" }} />
          )}
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Switch to {theme.palette.mode === "dark" ? "Light" : "Dark"} Mode
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Change theme appearance
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => { setIsSidebarOpen(false); closeSettings(); }}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ChevronLeft sx={{ fontSize: "20px" }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Close Sidebar
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hide navigation panel
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            closeSettings();
            navigate('/admin');
          }}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <AdminPanelSettingsOutlined sx={{ fontSize: "20px" }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Admin Management
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage admin users
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            closeSettings();
            const ok = window.confirm('This will clear all local data and refresh the page. Continue?');
            if (!ok) return;
            try { localStorage.clear(); sessionStorage.clear(); } catch {}
            try { window.location.reload(); } catch {}
          }}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            color: theme.palette.warning.main
          }}
        >
          <CloseIcon sx={{ fontSize: "20px" }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Clear Cache & Reload
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reset local storage
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Sidebar;
