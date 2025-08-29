import { Typography, Box, useTheme } from "@mui/material";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box sx={{ pb: 1.25, mb: 2, borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
      <Typography
        variant="h2"
        color={theme.palette.secondary[100]}
        fontWeight="bold"
        sx={{ mb: 0.5 }}
      >
        {title}
      </Typography>
      <Typography variant="h5" color={theme.palette.text.secondary}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
