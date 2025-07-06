import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Stack,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  AttachMoney,
  Group,
  Add,
  Visibility,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import CustomButton from '../components/CustomButton';
import { StorageService } from '../services/storage';
import { FinanceService } from '../services/finance';
import { formatters } from '../utils/formatters';
import type { BankAccount, Investment, DollarQuote } from '../types';

export function meta() {
  return [
    { title: "Dashboard - Gerente Bancário" },
    { name: "description", content: "Sistema de gerenciamento bancário" },
  ];
}

export default function Home() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [dollarQuote, setDollarQuote] = useState<DollarQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados locais
      const accountsData = StorageService.getAccounts();
      const investmentsData = StorageService.getInvestments();
      
      setAccounts(accountsData);
      setInvestments(investmentsData);
      
      // Carregar cotação do dólar
      const response = await FinanceService.getDollarQuote();
      if (response.success && response.data) {
        setDollarQuote(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(acc => acc.status === 'ACTIVE').length,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
    totalInvestments: investments.length,
    investmentValue: investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0),
  };

  const recentAccounts = accounts.slice(0, 5);
  const recentInvestments = investments.slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner loading={true} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        {error && (
          <Box sx={{ mb: 3 }}>
            <ErrorAlert 
              open={true}
              message={error} 
              onClose={() => setError(null)}
            />
          </Box>
        )}

        {/* Estatísticas */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 3
          }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <AccountBalance />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.totalAccounts}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Contas
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="success.main">
                  {stats.activeAccounts} ativas
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {formatters.currency(stats.totalBalance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Saldo Total
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{stats.totalInvestments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Investimentos
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="info.main">
                  {formatters.currency(stats.investmentValue)}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <AttachMoney />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {dollarQuote ? formatters.currency(dollarQuote.price) : '--'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dólar (USD/BRL)
                    </Typography>
                  </Box>
                </Box>
                {dollarQuote && (
                  <Chip
                    label={`${dollarQuote.change > 0 ? '+' : ''}${dollarQuote.changePercent.toFixed(2)}%`}
                    color={dollarQuote.change > 0 ? 'success' : 'error'}
                    size="small"
                  />
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Contas e Investimentos */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3
        }}>
          {/* Contas Recentes */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Contas Recentes</Typography>
                <Button
                  component={Link}
                  to="/accounts"
                  variant="text"
                  size="small"
                  endIcon={<Visibility />}
                >
                  Ver Todas
                </Button>
              </Box>
              
              {recentAccounts.length === 0 ? (
                <Alert severity="info">
                  Nenhuma conta cadastrada ainda.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Conta</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {account.customerName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {account.accountNumber}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatters.currency(account.balance)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={account.status}
                              color={account.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/accounts/new"
                variant="contained"
                startIcon={<Add />}
                fullWidth
              >
                Nova Conta
              </Button>
            </CardActions>
          </Card>

          {/* Investimentos Recentes */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Investimentos Recentes</Typography>
                <Button
                  component={Link}
                  to="/investments"
                  variant="text"
                  size="small"
                  endIcon={<Visibility />}
                >
                  Ver Todos
                </Button>
              </Box>
              
              {recentInvestments.length === 0 ? (
                <Alert severity="info">
                  Nenhum investimento cadastrado ainda.
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Símbolo</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell align="right">Quantidade</TableCell>
                        <TableCell align="right">Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentInvestments.map((investment) => (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {investment.symbol}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {investment.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {investment.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatters.currency(investment.quantity * investment.currentPrice)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/investments/new"
                variant="contained"
                startIcon={<Add />}
                fullWidth
              >
                Novo Investimento
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}
