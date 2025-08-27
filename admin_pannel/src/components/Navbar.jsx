import { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
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
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";

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

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar
      sx={{
        position: "static",
        background: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/*  Left side  */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>

          <FlexBetween
            backgroundColor={theme.palette.background.alt}
            borderRadius="9px"
            gap="3rem"
            p="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search ... " />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>
        {/*  Right side */}

        <FlexBetween gap="1.5rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined sx={{ fontSize: "25px" }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton>
            <SettingsOutlined sx={{ fontSize: "25px" }} />
          </IconButton>

          <FlexBetween>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={profileImage}
                height="32px"
                width="32px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.85rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user.name}
                </Typography>

                <Typography
                  fontSize="0.75rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user.occupation}
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
                      let frontend = import.meta.env.VITE_FRONTEND_URL || `http://${window.location.hostname}:8080`;
                      try {
                        const u = new URL(frontend);
                        frontend = u.origin;
                      } catch (err) {}
                      const returnTo = encodeURIComponent(`${frontend.replace(/\/$/, '')}/auth`);
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

                  // Redirect to frontend auth page
                  let frontend = import.meta.env.VITE_FRONTEND_URL || `http://${window.location.hostname}:8080`;
                  try {
                    const u = new URL(frontend);
                    frontend = u.origin;
                  } catch (e) {
                    // keep fallback as-is
                  }
                  window.location.replace(`${frontend.replace(/\/$/, '')}/auth`);
                }}
              >
                Log out
              </MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
