import React from 'react';
import { Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  ErrorOutline,
} from '@mui/icons-material';
import Header from '../components/Header';

export function meta() {
  return [
    { title: "Página Não Encontrada - Gerente Bancário" },
    { name: "description", content: "Página não encontrada" },
  ];
}

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <ErrorOutline sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
            404
          </Typography>
          
          <Typography variant="h4" gutterBottom color="text.secondary">
            Página Não Encontrada
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 600 }}>
            A página que você está procurando não existe ou foi movida. 
            Verifique se o endereço está correto ou navegue para uma das páginas disponíveis.
          </Typography>
          
          <Card sx={{ maxWidth: 400, mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Páginas Disponíveis:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  • Dashboard - Página inicial
                </Typography>
                <Typography variant="body2">
                  • Contas Bancárias - Gerenciamento de contas
                </Typography>
                <Typography variant="body2">
                  • Investimentos - Gerenciamento de investimentos
                </Typography>
              </Stack>
            </CardContent>
          </Card>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              component={Link}
              to="/"
              variant="contained"
              startIcon={<Home />}
              size="large"
            >
              Ir para Dashboard
            </Button>
            
            <Button
              onClick={() => window.history.back()}
              variant="outlined"
              startIcon={<ArrowBack />}
              size="large"
            >
              Voltar
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
