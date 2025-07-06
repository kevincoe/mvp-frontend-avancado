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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  IconButton,
  Breadcrumbs,
  Paper,
  Divider,
  Chip,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Search,
  Refresh,
  TrendingUp,
  TrendingDown,
  AttachMoney,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { StorageService } from '../services/storage';
import { FinanceService } from '../services/finance';
import { formatters } from '../utils/formatters';
import type { Investment, BankAccount, StockQuote } from '../types';

export function meta() {
  return [
    { title: "Editar Investimento - Gerente Bancário" },
    { name: "description", content: "Edição de investimento" },
  ];
}

interface FormData {
  symbol: string;
  name: string;
  type: 'STOCK' | 'FUND' | 'BOND' | 'CRYPTO';
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditInvestment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingSymbol, setSearchingSymbol] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [formData, setFormData] = useState<FormData>({
    symbol: '',
    name: '',
    type: 'STOCK',
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  useEffect(() => {
    if (id) {
      loadInvestment();
    }
  }, [id]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const investments = StorageService.getInvestments();
      const accountsData = StorageService.getAccounts();
      
      const investmentData = investments.find(inv => inv.id === id);
      if (!investmentData) {
        setError('Investimento não encontrado');
        return;
      }
      
      setInvestment(investmentData);
      setAccounts(accountsData);
      
      // Preencher formulário com dados atuais
      setFormData({
        symbol: investmentData.symbol,
        name: investmentData.name,
        type: investmentData.type,
        quantity: investmentData.quantity,
        purchasePrice: investmentData.purchasePrice,
        purchaseDate: new Date(investmentData.purchaseDate),
      });
      
      // Buscar cotação atual
      await searchSymbol(investmentData.symbol);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar investimento');
    } finally {
      setLoading(false);
    }
  };

  const searchSymbol = async (symbol: string) => {
    if (!symbol.trim()) {
      setQuote(null);
      return;
    }
    
    try {
      setSearchingSymbol(true);
      const result = await FinanceService.getStockQuote(symbol);
      
      if (result.success && result.data) {
        setQuote(result.data);
        setFormData(prev => ({
          ...prev,
          name: result.data!.name || symbol,
        }));
      } else {
        setQuote(null);
        setAlertState({
          open: true,
          message: `Não foi possível encontrar informações para o símbolo "${symbol}". Verifique se está correto.`,
          severity: 'error',
        });
      }
    } catch (err) {
      setQuote(null);
      console.error('Erro ao buscar símbolo:', err);
    } finally {
      setSearchingSymbol(false);
    }
  };

  const handleSearchSymbol = () => {
    searchSymbol(formData.symbol);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Símbolo é obrigatório';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Preço de compra deve ser maior que zero';
    }
    
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Data de compra é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !investment) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const updatedInvestment: Investment = {
        ...investment,
        symbol: formData.symbol.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type,
        quantity: formData.quantity,
        purchasePrice: formData.purchasePrice,
        purchaseDate: formData.purchaseDate,
        currentPrice: quote?.price || investment.currentPrice,
        lastUpdate: new Date(),
      };
      
      const investments = StorageService.getInvestments();
      const updatedInvestments = investments.map(inv => 
        inv.id === investment.id ? updatedInvestment : inv
      );
      
      StorageService.saveInvestments(updatedInvestments);
      
      setAlertState({
        open: true,
        message: 'Investimento atualizado com sucesso!',
        severity: 'success',
      });
      
      // Redirecionar após sucesso
      setTimeout(() => {
        navigate(`/investments/${investment.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar investimento');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
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

  const totalValue = formData.quantity * formData.purchasePrice;
  const currentValue = quote ? formData.quantity * quote.price : 0;
  const potentialReturn = currentValue - totalValue;
  const returnPercent = totalValue > 0 ? (potentialReturn / totalValue) * 100 : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link to="/investments" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography color="text.primary">Investimentos</Typography>
            </Link>
            <Link to={`/investments/${investment.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography color="text.primary">{investment.symbol}</Typography>
            </Link>
            <Typography color="text.secondary">
              Editar
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Stack direction="row" alignItems="center" sx={{ mb: 3 }}>
            <IconButton onClick={() => navigate(`/investments/${investment.id}`)} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Editar Investimento
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {/* Formulário */}
              <Box sx={{ flex: '1 1 600px', minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informações do Investimento
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Stack spacing={3}>
                      {/* Símbolo */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                        <TextField
                          label="Símbolo"
                          value={formData.symbol}
                          onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                          error={!!errors.symbol}
                          helperText={errors.symbol}
                          placeholder="Ex: PETR4, VALE3, ITUB4"
                          fullWidth
                          required
                        />
                        <IconButton
                          onClick={handleSearchSymbol}
                          disabled={!formData.symbol.trim() || searchingSymbol}
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          {searchingSymbol ? <CircularProgress size={24} /> : <Search />}
                        </IconButton>
                      </Box>

                      {/* Nome */}
                      <TextField
                        label="Nome"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        placeholder="Nome do investimento"
                        required
                        fullWidth
                      />

                      {/* Tipo */}
                      <FormControl fullWidth>
                        <InputLabel>Tipo de Investimento</InputLabel>
                        <Select
                          value={formData.type}
                          label="Tipo de Investimento"
                          onChange={(e) => handleInputChange('type', e.target.value)}
                        >
                          <MenuItem value="STOCK">Ação</MenuItem>
                          <MenuItem value="FUND">Fundo</MenuItem>
                          <MenuItem value="BOND">Título</MenuItem>
                          <MenuItem value="CRYPTO">Criptomoeda</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Quantidade e Preço */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          label="Quantidade"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                          error={!!errors.quantity}
                          helperText={errors.quantity}
                          inputProps={{ min: 0, step: 1 }}
                          required
                          fullWidth
                        />
                        <TextField
                          label="Preço de Compra"
                          type="number"
                          value={formData.purchasePrice}
                          onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                          error={!!errors.purchasePrice}
                          helperText={errors.purchasePrice}
                          inputProps={{ min: 0, step: 0.01 }}
                          InputProps={{
                            startAdornment: <Typography color="text.secondary">R$</Typography>,
                          }}
                          required
                          fullWidth
                        />
                      </Box>

                      {/* Data de Compra */}
                      <DatePicker
                        label="Data de Compra"
                        value={formData.purchaseDate}
                        onChange={(date) => handleInputChange('purchaseDate', date)}
                        slotProps={{
                          textField: {
                            error: !!errors.purchaseDate,
                            helperText: errors.purchaseDate,
                            required: true,
                            fullWidth: true,
                          },
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Box>

              {/* Resumo e Cotação */}
              <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
                <Stack spacing={3}>
                  {/* Resumo do Investimento */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumo
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Valor Investido
                          </Typography>
                          <Typography variant="h6">
                            {formatters.currency(totalValue)}
                          </Typography>
                        </Box>
                        
                        {quote && (
                          <>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Valor Atual
                              </Typography>
                              <Typography variant="h6">
                                {formatters.currency(currentValue)}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Retorno Potencial
                              </Typography>
                              <Typography 
                                variant="h6"
                                color={potentialReturn >= 0 ? 'success.main' : 'error.main'}
                              >
                                {potentialReturn >= 0 ? '+' : ''}{formatters.currency(potentialReturn)}
                              </Typography>
                              <Typography 
                                variant="body2"
                                color={potentialReturn >= 0 ? 'success.main' : 'error.main'}
                              >
                                {potentialReturn >= 0 ? '+' : ''}{formatters.percentage(returnPercent)}
                              </Typography>
                            </Box>
                          </>
                        )}
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
                        <Divider sx={{ mb: 2 }} />
                        
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {quote.name}
                            </Typography>
                            <Typography variant="h5">
                              {formatters.currency(quote.price)}
                            </Typography>
                          </Box>
                          
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
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Botões */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/investments/${investment.id}`)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>
          </Box>
        </Container>

        {/* Backdrop para loading */}
        <Backdrop open={saving} style={{ zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Alert */}
        <ErrorAlert
          open={alertState.open}
          message={alertState.message}
          severity={alertState.severity}
          onClose={handleCloseAlert}
        />
      </Box>
    </LocalizationProvider>
  );
}
