import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { themeSettings } from "./theme";
import { useSelector } from "react-redux";
import { useMemo, useEffect } from "react";

import Layout from "@scenes/layout";
import AdminRouteGuard from "@components/AdminRouteGuard";
import Dashboard from "@scenes/dashboard";
// client
import Products from "@scenes/products";
import Customers from "@scenes/customers";
import Transactions from "@scenes/transactions";
import Geography from "@scenes/geography";
import Orders from "@scenes/orders";

// sales
import Overview from "@scenes/overview";
import Daily from "@scenes/daily";
import Monthly from "@scenes/monthly";
import Breakdown from "@scenes/breakdown";
import Testimonials from "@scenes/testimonials";

// management
import Admin from "@scenes/admin";
import Performance from "@scenes/performance";
import AuthFallback from "./pages/AuthFallback";
import Banners from "@scenes/banners";

import "./App.css";

function App() {
  const mode = useSelector((state) => (state && state.global && state.global.mode) || 'dark');
  const theme = useMemo(() => createTheme(themeSettings(mode || 'dark')), [mode]);

  // Capture token from URL (?t=...) for cross-origin handoff from main site
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const t = url.searchParams.get('t');
      if (t) {
        try { localStorage.setItem('token', t); } catch {}
        // Clean the URL
        url.searchParams.delete('t');
        const clean = url.pathname + (url.search ? url.search : '') + (url.hash || '');
        window.history.replaceState({}, '', clean);
      }
    } catch {}
  }, []);

  // Persist theme mode on change
  useEffect(() => {
    try { localStorage.setItem('admin_theme_mode', mode === 'light' ? 'light' : 'dark'); } catch {}
  }, [mode]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route element={<AdminRouteGuard><Layout /></AdminRouteGuard>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/*  client */}
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/geography" element={<Geography />} />

              {/* sales */}
              <Route path="/overview" element={<Overview />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/monthly" element={<Monthly />} />
              <Route path="/breakdown" element={<Breakdown />} />

              {/* management */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/banners" element={<Banners />} />
              <Route path="/testimonials" element={<Testimonials />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
