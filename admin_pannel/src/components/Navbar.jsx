import { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Close as CloseIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from "@mui/icons-material";

import FlexBetween from "@components/FlexBetween";
import { useDispatch } from "react-redux";
import { setMode } from "@state";
import profileImage from "@assets/profile.jpg";
import { getApiBase } from "@utils/apiBase";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Utility to clear all cookies for this domain
function clearAllCookies() {
  try {
    const cookies = document.cookie.split(';');
    for (let c of cookies) {
      const eqPos = c.indexOf('=');
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname + ';';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }
  } catch (e) {}
}

const Navbar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  // Settings menu
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  const settingsOpen = Boolean(settingsAnchor);
  const openSettings = (e) => setSettingsAnchor(e.currentTarget);
  const closeSettings = () => setSettingsAnchor(null);

  // Search dialog
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const routes = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Products', to: '/products' },
    { label: 'Customers', to: '/customers' },
    { label: 'Orders', to: '/orders' },
    { label: 'Transactions', to: '/transactions' },
    { label: 'Geography', to: '/geography' },
    { label: 'Overview', to: '/overview' },
    { label: 'Daily', to: '/daily' },
    { label: 'Monthly', to: '/monthly' },
    { label: 'Breakdown', to: '/breakdown' },
    { label: 'Admin', to: '/admin' },
    { label: 'Performance', to: '/performance' },
    { label: 'Banners', to: '/banners' },
  ];
  const filteredRoutes = routes.filter(r => r.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const executeNav = (to) => {
    setSearchOpen(false);
    setSearchQuery("");
    try { navigate(to); } catch (e) {}
    if (!isSmall) return;
    // close sidebar on mobile when navigating
    try { setIsSidebarOpen(false); } catch {}
  };

  // Resolve avatar/photo URL for user/admin with robust fallbacks
  const resolveAvatarSrc = () => {
    try {
      const candidates = [
        user && user.profile_pic,
        user && (user.photo || user.avatar || user.image || user.imageUrl || user.profileImage || user.picture || user.profilePic || user.profile_photo || user.photoURL),
        // Role-specific fields that might exist
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
        if (/^https?:\/\//i.test(raw)) return raw; // absolute URL
        if (raw.startsWith('/')) return origin + raw; // absolute path on API origin
        return `${origin}/${raw}`; // relative path -> join
      }
    } catch (e) {}
    return profileImage; // fallback bundled avatar
  };

  return (
    <AppBar
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: (theme) => theme.zIndex.modal + 1,
        // Translucent blurred background
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(20, 24, 35, 0.45)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'saturate(180%) blur(10px)',
        WebkitBackdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: (theme) =>
          `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        boxShadow: 'none',
        transform: 'translateZ(0)', // promote to its own layer to reduce jank
      }}
    >
      <Toolbar sx={{
        justifyContent: "space-between",
        minHeight: { xs: 56, sm: 64 },
        pt: 'env(safe-area-inset-top)',
        position: 'relative',
        px: { xs: 1, sm: 2 }
      }}>
        {/*  Left side  */}
        <FlexBetween>
          <IconButton
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </FlexBetween>
        {/*  Right side */}

        <FlexBetween gap={{ xs: "0.5rem", sm: "1rem" }} sx={{ position: 'relative', zIndex: (t) => t.zIndex.modal + 2 }}>
          {isSmall && (
            <IconButton 
              aria-label="Search" 
              onClick={() => setSearchOpen(true)} 
              sx={{ zIndex: (t) => t.zIndex.modal + 3 }}
              size="small"
            >
              <Search sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
            </IconButton>
          )}
          <IconButton
            onClick={() => dispatch(setMode())}
            sx={{ zIndex: (t) => t.zIndex.modal + 3 }}
            aria-label="Toggle theme"
            size="small"
          >
            {theme.palette.mode === "dark" ? (
              <LightModeOutlined sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
            ) : (
              <DarkModeOutlined sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
            )}
          </IconButton>
          <IconButton 
            aria-label="Settings" 
            onClick={openSettings} 
            sx={{ zIndex: (t) => t.zIndex.modal + 3 }}
            size="small"
          >
            <SettingsOutlined sx={{ fontSize: { xs: "20px", sm: "24px" } }} />
          </IconButton>

          <FlexBetween sx={{ position: 'relative', zIndex: 1 }}>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: { xs: "0.5rem", sm: "1rem" },
                minWidth: 'auto',
                px: { xs: 0.5, sm: 1 },
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={resolveAvatarSrc()}
                height="32px"
                width="32px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
                onError={(e) => { try { e.currentTarget.src = profileImage; } catch (_) {} }}
              />
              <Box textAlign="left" sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  fontWeight="bold"
                  fontSize="0.85rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user && (user.name || user.first_name) 
                    ? (user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()) 
                    : "Admin User"}
                </Typography>

                <Typography
                  fontSize="0.75rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user?.occupation || user?.role || "Administrator"}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
              />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <MenuItem
                onClick={async () => {
                  handleClose();
                  // Attempt server-side logout via POST so httpOnly cookies are cleared
                  try {
                    const apiBase = getApiBase();
                    await fetch(`${apiBase}/clients/logout`, { method: 'POST', credentials: 'include' });
                  } catch (e) {
                    console.debug('[admin logout] POST /api/clients/logout failed, will fallback to GET /api/logout', e);
                    // fallback to top-level logout navigation which is most reliable for expiring httpOnly cookies
                    try {
                      const backendOrigin = getApiBase().replace(/\/?api\/?$/i, '').replace(/\/$/, '');
                      const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
                      let frontend = import.meta.env.VITE_FRONTEND_URL;
                      if (!frontend) {
                        frontend = isProd ? 'https://zixx.vercel.app' : `http://${window.location.hostname}`;
                      }
                      try { const u = new URL(frontend); frontend = u.origin; } catch (err) {}
                      const returnTo = encodeURIComponent(`${frontend}/auth`);
                      const fallbackUrl = `${backendOrigin}/api/logout?returnTo=${returnTo}`;
                      window.location.href = fallbackUrl;
                      return;
                    } catch (er) {
                      console.debug('[admin logout] fallback navigation failed', er);
                    }
                  }

                  // Local cleanup (remove tokens/state and cookies we can) and notify other tabs
                  try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
                  try { clearAllCookies(); } catch (e) {}
                  try {
                    if (typeof window !== 'undefined') {
                      const bc = new BroadcastChannel('auth');
                      bc.postMessage({ type: 'logout' });
                      bc.close();
                      window.dispatchEvent(new CustomEvent('auth:logout'));
                    }
                  } catch (e) {}

                  // Also notify main site origin instantly via hidden iframe to /logout-sync.html
                  // This makes zixx.vercel.app tabs receive storage/BroadcastChannel events on their origin
                  try {
                    const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
                    let frontendOrigin = import.meta.env.VITE_FRONTEND_URL;
                    if (!frontendOrigin) {
                      frontendOrigin = isProd ? 'https://zixx.vercel.app' : `http://${window.location.hostname}`;
                    }
                    try { const u = new URL(frontendOrigin); frontendOrigin = u.origin; } catch (e) {}
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.referrerPolicy = 'no-referrer';
                    iframe.src = `${frontendOrigin}/logout-sync.html`;
                    document.body.appendChild(iframe);
                    setTimeout(() => { try { document.body.removeChild(iframe); } catch (e) {} }, 4000);
                  } catch (e) {}

                  // Redirect to frontend auth page
                  const isProd = !!(import.meta && import.meta.env && import.meta.env.PROD);
                  let frontend = import.meta.env.VITE_FRONTEND_URL;
                  if (!frontend) {
                    frontend = isProd ? 'https://zixx.vercel.app' : `http://${window.location.hostname}`;
                  }
                  try { const u = new URL(frontend); frontend = u.origin; } catch (e) {}
                  window.location.replace(`${frontend}/auth`);
                }}
              >
                Log out
              </MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>

        {/* Centered search (desktop only) */}
        {!isSmall && (
          <Box sx={{ 
            position: 'absolute', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: { md: '300px', lg: '350px', xl: '400px' }, 
            maxWidth: '400px',
            zIndex: 1
          }}>
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="1rem"
              p="0.1rem 1rem"
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1]
              }}
            >
              <InputBase
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filteredRoutes[0];
                    if (first) executeNav(first.to);
                  }
                }}
                fullWidth
                sx={{ fontSize: '0.9rem' }}
              />
              <IconButton onClick={() => setSearchOpen(true)} size="small">
                <Search />
              </IconButton>
            </FlexBetween>
          </Box>
        )}
      </Toolbar>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Search</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: theme.palette.background.alt, borderRadius: 1, px: 1 }}>
            <Search fontSize="small" />
            <InputBase
              autoFocus
              fullWidth
              placeholder="Type to search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const first = filteredRoutes[0];
                  if (first) executeNav(first.to);
                }
              }}
            />
          </Box>
          <List dense>
            {filteredRoutes.map((r) => (
              <ListItemButton key={r.to} onClick={() => executeNav(r.to)}>
                <ListItemText primary={r.label} secondary={r.to} />
              </ListItemButton>
            ))}
            {filteredRoutes.length === 0 && (
              <Box sx={{ p: 2, color: theme.palette.text.secondary }}>No matches</Box>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={settingsOpen}
        onClose={closeSettings}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
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
              Change the theme appearance
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => { setIsSidebarOpen((v) => !v); closeSettings(); }}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <MenuIcon sx={{ fontSize: "20px" }} />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Toggle navigation panel
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
              Reset local storage and refresh
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Navbar;
