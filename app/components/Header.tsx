import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccountBalance,
  Dashboard,
  AccountBox,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/', icon: Dashboard },
    { label: 'Contas', path: '/accounts', icon: AccountBox },
    { label: 'Investimentos', path: '/investments', icon: TrendingUp },
  ];

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Logo e Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <AccountBalance sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Gerente Bancário
          </Typography>
        </Box>

        {/* Navegação Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={<Icon />}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: isCurrentPath(item.path) 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Espaçador */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navegação Mobile */}
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  color="inherit"
                  size="small"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    backgroundColor: isCurrentPath(item.path) 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'transparent',
                  }}
                >
                  <Icon />
                </Button>
              );
            })}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;