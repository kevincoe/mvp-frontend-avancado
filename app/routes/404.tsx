import React from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  ErrorOutline,
  AccountBalance,
  TrendingUp,
  Dashboard,
  Search,
} from '@mui/icons-material';
import Header from '../components/Header';

export function meta() {
  return [
    { title: "Página Não Encontrada - Gerente Bancário" },
    { name: "description", content: "Página não encontrada - Sistema de Gerenciamento Bancário" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export async function loader() {
  return null;
}

interface NavigationCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const navigationOptions: NavigationCard[] = [
  {
    title: "Dashboard",
    description: "Visão geral dos dados financeiros",
    icon: <Dashboard />,
    path: "/",
    color: "primary.main"
  },
  {
    title: "Contas Bancárias",
    description: "Gerenciar contas dos clientes",
    icon: <AccountBalance />,
    path: "/accounts",
    color: "secondary.main"
  },
  {
    title: "Investimentos",
    description: "Gerenciar carteiras de investimento",
    icon: <TrendingUp />,
    path: "/investments",
    color: "success.main"
  }
];

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Home</Typography>
          </Link>
          <Typography color="text.secondary">404</Typography>
        </Breadcrumbs>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {/* Error Icon */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              mb: 4, 
              backgroundColor: 'error.light',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main' }} />
          </Paper>
          
          {/* Error Code */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '3rem', md: '4rem' }, 
              fontWeight: 'bold', 
              mb: 2,
              color: 'error.main'
            }}
          >
            404
          </Typography>
          
          {/* Error Title */}
          <Typography variant="h4" gutterBottom color="text.primary" sx={{ mb: 2 }}>
            Página Não Encontrada
          </Typography>
          
          {/* Error Description */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, lineHeight: 1.6 }}
          >
            A página que você está procurando não existe, foi movida ou está temporariamente indisponível. 
            Verifique se o endereço está correto ou navegue para uma das páginas disponíveis abaixo.
          </Typography>
          
          {/* Quick Actions */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 6 }}
          >
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home />}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Ir para Dashboard
            </Button>
            
            <Button
              onClick={handleGoBack}
              variant="outlined"
              startIcon={<ArrowBack />}
              size="large"
              sx={{ minWidth: 200 }}
            >
              Voltar
            </Button>
          </Stack>

          {/* Navigation Cards */}
          <Box sx={{ width: '100%', maxWidth: 800 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Páginas Disponíveis:
            </Typography>
            
            <Grid container spacing={3}>
              {navigationOptions.map((option) => (
                <Grid item xs={12} md={4} key={option.path}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(option.path)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: option.color,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {option.icon}
                      </Avatar>
                      
                      <Typography variant="h6" gutterBottom>
                        {option.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Help Section */}
          <Card sx={{ mt: 6, width: '100%', maxWidth: 600 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search />
                Precisa de ajuda?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Se você continuar tendo problemas para encontrar o que procura, 
                verifique se o endereço foi digitado corretamente ou entre em contato 
                com o suporte técnico.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}