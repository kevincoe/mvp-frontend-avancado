import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Save,
  Cancel,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { StorageService } from '../services/storage';
import { FinanceService } from '../services/finance';
import { ValidationService } from '../services/validation';
import { useForm } from '../hooks/useForm';
import { formatters, utils } from '../utils/formatters';
import type { Investment, BankAccount, StockQuote } from '../types';

export function meta() {
  return [
    { title: "Novo Investimento - Gerente Bancário" },
    { name: "description", content: "Cadastro de novo investimento" },
  ];
}

interface FormData {
  accountId: string;
  symbol: string;
  name: string;
  type: 'STOCK' | 'FUND' | 'BOND' | 'CRYPTO' | '';
  quantity: number;
  purchasePrice: number;
}

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
];

export default function NewInvestment() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [searchingStock, setSearchingStock] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null);
  const [symbolSuggestions] = useState(POPULAR_SYMBOLS);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Enhanced form with validation
  const {
    values: formData,
    errors,
    isSubmitting,
    handleChange: handleFormChange,
    handleSubmit,
    setFieldError,
    validateForm
  } = useForm<FormData>({
    initialValues: {
      accountId: '',
      symbol: '',
      name: '',
      type: '',
      quantity: 1,
      purchasePrice: 0,
    },
    validationSchema: {
      ...ValidationService.investmentSchema,
      accountId: { required: true }
    },
    onSubmit: async (values) => {
      await submitInvestment(values);
    }
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = StorageService.getAccounts();
      setAccounts(accountsData);
      
      if (accountsData.length === 0) {
        setAlertState({
          open: true,
          message: 'Nenhuma conta encontrada. Crie uma conta primeiro.',
          severity: 'warning',
        });
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
    }
  };

  // Debounced symbol search
  const debouncedSearchSymbol = useCallback(
    utils.debounce(async (symbol: string) => {
      if (!symbol || symbol.length < 2) return;
      
      try {
        setSearchingStock(true);
        const result = await FinanceService.getStockQuote(symbol);
        
        if (result.success && result.data) {
          setCurrentQuote(result.data);
          handleFormChange('name', result.data.name);
          handleFormChange('purchasePrice', result.data.price);
          
          setAlertState({
            open: true,
            message: `Cotação encontrada: ${result.data.name} - ${formatters.currency(result.data.price)}`,
            severity: 'success',
          });
        } else {
          setCurrentQuote(null);
          setAlertState({
            open: true,
            message: `Símbolo "${symbol}" não encontrado. Verifique se está correto.`,
            severity: 'warning',
          });
        }
      } catch (err) {
        setCurrentQuote(null);
        console.error('Erro ao buscar símbolo:', err);
      } finally {
        setSearchingStock(false);
      }
    }, 800),
    [handleFormChange]
  );

  const handleInputChange = (field: keyof FormData, value: any) => {
    handleFormChange(field, value);
    
    // Auto-search symbol
    if (field === 'symbol' && typeof value === 'string') {
      debouncedSearchSymbol(value.toUpperCase());
    }
  };

  const submitInvestment = async (values: FormData) => {
    try {
      // Simulate delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newInvestment: Investment = {
        id: crypto.randomUUID(),
        accountId: values.accountId,
        symbol: values.symbol.toUpperCase().trim(),
        name: values.name.trim(),
        type: values.type as any,
        quantity: values.quantity,
        purchasePrice: values.purchasePrice,
        currentPrice: values.purchasePrice,
        purchaseDate: new Date(),
        lastUpdate: new Date(),
      };

      const existingInvestments = StorageService.getInvestments();
      const updatedInvestments = [...existingInvestments, newInvestment];
      StorageService.saveInvestments(updatedInvestments);
      
      setAlertState({
        open: true,
        message: 'Investimento criado com sucesso!',
        severity: 'success',
      });
      
      // Redirect after success
      setTimeout(() => {
        navigate('/investments');
      }, 2000);
      
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar investimento');
    }
  };

  const handleCancel = () => {
    navigate('/investments');
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  if (accounts.length === 0 && !alertState.open) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner loading={true} message="Carregando contas..." />
        </Box>
      </Box>
    );
  }

  const totalValue = formData.quantity * formData.purchasePrice;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            Novo Investimento
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Main Form */}
          <Box sx={{ flex: '1 1 600px', minWidth: '300px', position: 'relative' }}>
            {/* Loading Overlay */}
            {isSubmitting && (
              <LoadingSpinner 
                loading={true} 
                message="Salvando investimento..."
                variant="backdrop"
                fullScreen={false}
              />
            )}
            
            <Card>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Informações do Investimento
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Stack spacing={3}>
                    {/* Account Selection */}
                    <FormControl fullWidth error={!!errors.accountId}>
                      <InputLabel>Conta Bancária *</InputLabel>
                      <Select
                        value={formData.accountId}
                        label="Conta Bancária *"
                        onChange={(e) => handleInputChange('accountId', e.target.value)}
                      >
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            <Box>
                              <Typography variant="body2">
                                {account.customerName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {account.accountNumber} - {formatters.currency(account.balance)}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.accountId && (
                        <Typography variant="caption" color="error">
                          {errors.accountId}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Symbol with Autocomplete */}
                    <Autocomplete
                      freeSolo
                      options={symbolSuggestions}
                      getOptionLabel={(option) => 
                        typeof option === 'string' ? option : option.symbol
                      }
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {typeof option === 'string' ? option : option.symbol}
                            </Typography>
                            {typeof option === 'object' && (
                              <Typography variant="caption" color="text.secondary">
                                {option.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Símbolo *"
                          error={!!errors.symbol}
                          helperText={errors.symbol || 'Digite ou selecione um símbolo (ex: AAPL, MSFT)'}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {searchingStock && <CircularProgress size={20} />}
                                {currentQuote && <CheckCircle color="success" />}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      value={formData.symbol}
                      onInputChange={(_, value) => handleInputChange('symbol', value.toUpperCase())}
                    />

                    {/* Name */}
                    <TextField
                      label="Nome do Investimento *"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      fullWidth
                    />

                    {/* Type */}
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Tipo de Investimento *</InputLabel>
                      <Select
                        value={formData.type}
                        label="Tipo de Investimento *"
                        onChange={(e) => handleInputChange('type', e.target.value)}
                      >
                        <MenuItem value="STOCK">
                          <Chip label="Ação" color="primary" size="small" sx={{ mr: 1 }} />
                          Ação
                        </MenuItem>
                        <MenuItem value="FUND">
                          <Chip label="Fundo" color="secondary" size="small" sx={{ mr: 1 }} />
                          Fundo
                        </MenuItem>
                        <MenuItem value="BOND">
                          <Chip label="Título" color="warning" size="small" sx={{ mr: 1 }} />
                          Título
                        </MenuItem>
                        <MenuItem value="CRYPTO">
                          <Chip label="Crypto" color="info" size="small" sx={{ mr: 1 }} />
                          Criptomoeda
                        </MenuItem>
                      </Select>
                      {errors.type && (
                        <Typography variant="caption" color="error">
                          {errors.type}
                        </Typography>
                      )}
                    </FormControl>

                    {/* Quantity */}
                    <TextField
                      label="Quantidade *"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      inputProps={{ min: 0.001, step: 0.001 }}
                      fullWidth
                    />

                    {/* Purchase Price */}
                    <TextField
                      label="Preço de Compra *"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || 0)}
                      error={!!errors.purchasePrice}
                      helperText={errors.purchasePrice || (currentQuote ? 'Preço baseado na cotação atual' : '')}
                      inputProps={{ min: 0.01, step: 0.01 }}
                      fullWidth
                      InputProps={{
                        startAdornment: currentQuote && <CheckCircle color="success" sx={{ mr: 1 }} />,
                      }}
                    />

                    {/* Total Value Display */}
                    {totalValue > 0 && (
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Valor Total do Investimento:</strong> {formatters.currency(totalValue)}
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', p: 3 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<Cancel />}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Investimento'}
                    </Button>
                  </Stack>
                </CardActions>
              </form>
            </Card>
          </Box>

          {/* Side Panel - Info & Status */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Stack spacing={3}>
              {/* API Status */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status da Cotação
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: searchingStock ? 'warning.main' : currentQuote ? 'success.main' : 'grey.400'
                        }} 
                      />
                      <Typography variant="body2">
                        {searchingStock ? 'Consultando...' : currentQuote ? 'Cotação encontrada' : 'Aguardando símbolo'}
                      </Typography>
                    </Box>
                    
                    {currentQuote && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {currentQuote.name}
                        </Typography>
                        <Typography variant="h6">
                          {formatters.currency(currentQuote.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Atualizado: {formatters.dateTime(currentQuote.marketTime)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Como Usar
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      1. Selecione uma conta bancária
                    </Typography>
                    <Typography variant="body2">
                      2. Digite ou selecione um símbolo
                    </Typography>
                    <Typography variant="body2">
                      3. O sistema buscará a cotação automaticamente
                    </Typography>
                    <Typography variant="body2">
                      4. Ajuste a quantidade desejada
                    </Typography>
                    <Typography variant="body2">
                      5. Clique em "Salvar Investimento"
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Popular Symbols */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Símbolos Populares
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    {POPULAR_SYMBOLS.slice(0, 5).map(({ symbol, name }) => (
                      <Box key={symbol} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {symbol}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {name.split(' ')[0]}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>

        {/* Alert */}
        <ErrorAlert
          open={alertState.open}
          message={alertState.message}
          severity={alertState.severity}
          onClose={handleCloseAlert}
        />
      </Container>
    </Box>
  );
}