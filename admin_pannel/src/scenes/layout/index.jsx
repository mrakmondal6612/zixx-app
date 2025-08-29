import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";

import { Outlet } from "react-router-dom";

import { useSelector } from "react-redux";

import Navbar from "@components/Navbar";
import Sidebar from "@components/Sidebar";

// import { useGetUserQuery } from "@state/api";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);

  const userId = useSelector((state) => (state && state.global && state.global.userId) || null);
  const data = {};

  // keep sidebar state in sync with breakpoint changes
  // open on desktop, closed on mobile by default
  useEffect(() => {
    setIsSidebarOpen(isNonMobile);
  }, [isNonMobile]);

  return (
    <Box
      display={isNonMobile ? "flex" : "block"}
      width="100%"
      sx={{ minHeight: "100vh", overflow: "visible" }}
    >
      <Sidebar
        user={data || {}}
        isNonMobile={isNonMobile}
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1} sx={{ minHeight: "100vh", overflow: "visible" }}>
        <Navbar
          user={data || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/* Spacer for fixed AppBar height (includes safe area inset) */}
        <Box sx={{ height: { xs: 'calc(56px + env(safe-area-inset-top))', sm: 'calc(64px + env(safe-area-inset-top))' } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
