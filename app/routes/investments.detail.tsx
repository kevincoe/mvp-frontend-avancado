import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Divider,
  Stack,
  Avatar,
  Alert,
  Breadcrumbs,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Timeline,
  CalendarToday,
  AttachMoney,
  Person,
  Phone,
  Email,
  Business,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import { StorageService } from '../services/storage';
import { FinanceService } from '../services/finance';
import { formatters } from '../utils/formatters';
import type { Investment, BankAccount, StockQuote } from '../types';

export function meta() {
  return [
    { title: "Detalhes do Investimento - Gerente Bancário" },
    { name: "description", content: "Visualização detalhada do investimento" },
  ];
}

export default function InvestmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvestment();
    }
  }, [id]);

  useEffect(() => {
    if (investment) {
      loadQuote();
    }
  }, [investment]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const investments = StorageService.getInvestments();
      const accounts = StorageService.getAccounts();
      
      const investmentData = investments.find(inv => inv.id === id);
      if (!investmentData) {
        setError('Investimento não encontrado');
        return;
      }
      
      const accountData = accounts.find(acc => acc.id === investmentData.accountId);
      
      setInvestment(investmentData);
      setAccount(accountData || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar investimento');
    } finally {
      setLoading(false);
    }
  };

  const loadQuote = async () => {
    if (!investment) return;
    
    try {
      setQuoteLoading(true);
      const quoteResult = await FinanceService.getStockQuote(investment.symbol);
      
      if (quoteResult.success && quoteResult.data) {
        setQuote(quoteResult.data);
        
        // Atualizar preço atual do investimento
        if (quoteResult.data.price !== investment.currentPrice) {
          const updatedInvestment = {
            ...investment,
            currentPrice: quoteResult.data.price,
            lastUpdate: new Date()
          };
          
          const investments = StorageService.getInvestments();
          const updatedInvestments = investments.map(inv => 
            inv.id === investment.id ? updatedInvestment : inv
          );
          
          StorageService.saveInvestments(updatedInvestments);
          setInvestment(updatedInvestment);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar cotação:', err);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!investment) return;
    
    try {
      const investments = StorageService.getInvestments();
      const updatedInvestments = investments.filter(inv => inv.id !== investment.id);
      StorageService.saveInvestments(updatedInvestments);
      
      navigate('/investments');
    } catch (err) {
      setError('Erro ao excluir investimento');
    }
  };

  const handleRefreshQuote = () => {
    loadQuote();
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <LoadingSpinner loading={loading} />
        </Container>
      </Box>
    );
  }

  if (error || !investment) {
    return (
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ErrorAlert open={true} message={error || 'Investimento não encontrado'} />
        </Container>
      </Box>
    );
  }

  const totalValue = investment.quantity * investment.currentPrice;
  const totalInvested = investment.quantity * investment.purchasePrice;
  const profit = totalValue - totalInvested;
  const profitPercent = ((profit / totalInvested) * 100);
  const isProfit = profit >= 0;

  const getInvestmentTypeColor = (type: string) => {
    switch (type) {
      case 'STOCK': return 'primary';
      case 'FUND': return 'secondary';
      case 'BOND': return 'warning';
      case 'CRYPTO': return 'error';
      default: return 'default';
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case 'STOCK': return 'Ação';
      case 'FUND': return 'Fundo';
      case 'BOND': return 'Título';
      case 'CRYPTO': return 'Criptomoeda';
      default: return type;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/investments" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography color="text.primary">Investimentos</Typography>
          </Link>
          <Typography color="text.secondary">
            {investment.symbol}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={() => navigate('/investments')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <Timeline />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {investment.symbol}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {investment.name}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              component={Link}
              to={`/investments/${investment.id}/edit`}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Excluir
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Informações do Investimento */}
            <Box sx={{ flex: '1 1 600px', minWidth: '300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações do Investimento
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Símbolo
                        </Typography>
                        <Typography variant="h6">
                          {investment.symbol}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Tipo
                        </Typography>
                        <Chip 
                          label={getInvestmentTypeLabel(investment.type)}
                          color={getInvestmentTypeColor(investment.type)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Quantidade
                        </Typography>
                        <Typography variant="h6">
                          {formatters.number(investment.quantity)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Data de Compra
                        </Typography>
                        <Typography variant="h6">
                          {formatters.date(investment.purchaseDate)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Preço de Compra
                        </Typography>
                        <Typography variant="h6">
                          {formatters.currency(investment.purchasePrice)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Preço Atual
                          <Tooltip title="Atualizar cotação">
                            <IconButton 
                              size="small" 
                              onClick={handleRefreshQuote}
                              disabled={quoteLoading}
                              sx={{ ml: 1 }}
                            >
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <Typography variant="h6">
                          {formatters.currency(investment.currentPrice)}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Última Atualização: {formatters.dateTime(investment.lastUpdate)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* Resumo Financeiro */}
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Stack spacing={3}>
                {/* Valor Total */}
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Valor Total
                        </Typography>
                        <Typography variant="h5">
                          {formatters.currency(totalValue)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Valor Investido */}
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'secondary.main' }}>
                        <AccountBalance />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Valor Investido
                        </Typography>
                        <Typography variant="h5">
                          {formatters.currency(totalInvested)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Lucro/Prejuízo */}
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ 
                        bgcolor: isProfit ? 'success.main' : 'error.main' 
                      }}>
                        {isProfit ? <TrendingUp /> : <TrendingDown />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {isProfit ? 'Lucro' : 'Prejuízo'}
                        </Typography>
                        <Typography 
                          variant="h5"
                          color={isProfit ? 'success.main' : 'error.main'}
                        >
                          {formatters.currency(Math.abs(profit))}
                        </Typography>
                        <Typography 
                          variant="body2"
                          color={isProfit ? 'success.main' : 'error.main'}
                        >
                          {isProfit ? '+' : '-'}{formatters.percentage(Math.abs(profitPercent))}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Cotação Atual */}
                {quote && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Cotação Atual
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {quote.name}
                      </Typography>
                      <Typography variant="h5" sx={{ my: 1 }}>
                        {formatters.currency(quote.price)}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {quote.change >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                        <Typography 
                          variant="body2"
                          color={quote.change >= 0 ? 'success.main' : 'error.main'}
                        >
                          {quote.change >= 0 ? '+' : ''}{formatters.currency(quote.change)}
                          ({quote.changePercent >= 0 ? '+' : ''}{formatters.percentage(quote.changePercent)})
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Atualizado: {formatters.dateTime(quote.marketTime)}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Box>
          </Box>

          {/* Conta Associada */}
          {account && (
            <Box sx={{ mt: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Conta Associada
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Person />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Titular
                            </Typography>
                            <Typography variant="body1">
                              {account.customerName}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Email />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              E-mail
                            </Typography>
                            <Typography variant="body1">
                              {account.customerEmail}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>
                    
                    <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Business />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Conta
                            </Typography>
                            <Typography variant="body1">
                              {account.accountNumber}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Phone />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Telefone
                            </Typography>
                            <Typography variant="body1">
                              {account.customerPhone}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/accounts/${account.id}`}
                      startIcon={<Visibility />}
                    >
                      Ver Conta
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Container>

      {/* Dialog de Confirmação */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o investimento ${investment.symbol}?`}
        variant="warning"
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="error"
      />
    </Box>
  );
}
