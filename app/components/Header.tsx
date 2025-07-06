import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalance,
  Dashboard,
  AccountBox,
  TrendingUp,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const isCurrentPath = (path: string) => {
    if (!mounted) return false;
    return location.pathname === path;
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/', icon: Dashboard },
    { label: 'Contas', path: '/accounts', icon: AccountBox },
    { label: 'Investimentos', path: '/investments', icon: TrendingUp },
  ];

  // Don't render dynamic content until mounted
  if (!mounted) {
    return (
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <AccountBalance sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Gerente Bancário
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar>
        {/* Menu Toggle Button para Mobile */}
        {showMenuButton && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo e Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <AccountBalance sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 0 }}>
            Gerente Bancário
          </Typography>
        </Box>

        {/* Navegação Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', ml: 4 }}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={<Icon />}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    mr: 1,
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

        {/* Menu do Usuário */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Menu do usuário">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'secondary.main',
                  fontSize: '0.875rem'
                }}
              >
                GM
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Navegação Mobile */}
            {isMobile && (
              <Box>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      selected={isCurrentPath(item.path)}
                    >
                      <Icon sx={{ mr: 2 }} />
                      {item.label}
                    </MenuItem>
                  );
                })}
                <Box sx={{ borderTop: 1, borderColor: 'divider', my: 1 }} />
              </Box>
            )}

            {/* Opções do Usuário */}
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 2 }} />
              Configurações
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Logout sx={{ mr: 2 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;