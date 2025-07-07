import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Save,
  Cancel,
  TrendingUp,
  Search,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { StorageService } from '../services/storage';
import { FinanceService } from '../services/finance';
import { formatters } from '../utils/formatters';
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
  quantity: string;
  purchasePrice: string;
}

interface FormErrors {
  accountId?: string;
  symbol?: string;
  name?: string;
  type?: string;
  quantity?: string;
  purchasePrice?: string;
}

export default function NewInvestment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [searchingStock, setSearchingStock] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<StockQuote | null>(null);
  const [formData, setFormData] = useState<FormData>({
    accountId: '',
    symbol: '',
    name: '',
    type: '',
    quantity: '1',
    purchasePrice: '0',
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
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = StorageService.getAccounts();
      const activeAccounts = accountsData.filter(acc => acc.status === 'ACTIVE');
      setAccounts(activeAccounts);
    } catch (err) {
      setError('Erro ao carregar contas');
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const searchStock = async (symbol: string) => {
    if (!symbol.trim()) {
      setCurrentQuote(null);
      return;
    }

    try {
      setSearchingStock(true);
      setCurrentQuote(null);
      
      console.log('🔍 Buscando cotação para:', symbol);
      
      // Buscar cotação via API
      const response = await FinanceService.getStockQuote(symbol);
      
      if (response.success && response.data) {
        console.log('✅ Cotação obtida:', response.data);
        
        setCurrentQuote(response.data);
        setFormData(prev => ({
          ...prev,
          name: response.data!.name || symbol.toUpperCase(),
          type: 'STOCK',
          purchasePrice: response.data!.price.toString(),
        }));

        setAlertState({
          open: true,
          message: `Cotação obtida: ${response.data.symbol} - ${formatters.currency(response.data.price)}`,
          severity: 'success',
        });
      } else {
        console.log('❌ Erro na API:', response.error);
        
        setAlertState({
          open: true,
          message: `Não foi possível obter a cotação para "${symbol}". Verifique se o símbolo está correto e disponível na bolsa americana.`,
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('❌ Erro ao buscar ação:', err);
      
      setAlertState({
        open: true,
        message: 'Erro ao buscar cotação. Verifique o símbolo e tente novamente.',
        severity: 'error',
      });
    } finally {
      setSearchingStock(false);
    }
  };

  const handleSearchClick = () => {
    if (formData.symbol.trim()) {
      searchStock(formData.symbol);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.accountId) {
      newErrors.accountId = 'Conta é obrigatória';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Símbolo é obrigatório';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.type) {
      newErrors.type = 'Tipo é obrigatório';
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchasePrice = 'Preço deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula um delay para a operação

      const newInvestment: Investment = {
        id: crypto.randomUUID(),
        accountId: formData.accountId,
        symbol: formData.symbol.toUpperCase().trim(),
        name: formData.name.trim(),
        type: formData.type as any,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        currentPrice: parseFloat(formData.purchasePrice), // Inicialmente igual ao preço de compra
        purchaseDate: new Date(),
        lastUpdate: new Date(),
      };

      const existingInvestments = StorageService.getInvestments();
      const updatedInvestments = [...existingInvestments, newInvestment];
      StorageService.saveInvestments(updatedInvestments);
      
      navigate('/investments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar investimento');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/investments');
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  const totalValue = parseFloat(formData.quantity) * parseFloat(formData.purchasePrice) || 0;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TrendingUp sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            Novo Investimento
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <ErrorAlert 
              open={true}
              message={error} 
              onClose={() => setError(null)}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Formulário Principal */}
          <Box sx={{ flex: '1 1 600px', minWidth: '300px' }}>
            <Card>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <Stack spacing={3}>
                    {/* Seleção de Conta */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Conta do Cliente
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <FormControl fullWidth error={!!errors.accountId} required>
                        <InputLabel>Selecionar Conta</InputLabel>
                        <Select
                          value={formData.accountId}
                          onChange={(e) => handleChange('accountId', e.target.value)}
                          label="Selecionar Conta"
                        >
                          {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>
                              {account.customerName} - {account.accountNumber} ({formatters.currency(account.balance)})
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.accountId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {errors.accountId}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>

                    {/* Dados do Investimento */}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Dados do Investimento
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Stack spacing={2}>
                        {/* Símbolo com busca manual */}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                          <TextField
                            label="Símbolo"
                            value={formData.symbol}
                            onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
                            error={!!errors.symbol}
                            helperText={errors.symbol || 'Digite o símbolo (ex: AAPL, MSFT, GOOGL)'}
                            required
                            sx={{ flexGrow: 1 }}
                            placeholder="Ex: AAPL"
                          />
                          <Button
                            variant="outlined"
                            onClick={handleSearchClick}
                            disabled={!formData.symbol || searchingStock}
                            startIcon={searchingStock ? <CircularProgress size={20} /> : <Search />}
                          >
                            {searchingStock ? 'Buscando...' : 'Buscar'}
                          </Button>
                        </Box>

                        {/* Cotação Atual */}
                        {currentQuote && (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Box>
                              <Typography variant="body2">
                                <strong>Cotação Atual:</strong> {currentQuote.symbol} - {formatters.currency(currentQuote.price)}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Nome:</strong> {currentQuote.name}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Variação:</strong> {currentQuote.change >= 0 ? '+' : ''}{formatters.currency(currentQuote.change)} 
                                ({currentQuote.changePercent >= 0 ? '+' : ''}{currentQuote.changePercent.toFixed(2)}%)
                              </Typography>
                            </Box>
                          </Alert>
                        )}

                        <TextField
                          fullWidth
                          label="Nome do Investimento"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          error={!!errors.name}
                          helperText={errors.name || 'Nome será preenchido automaticamente após busca'}
                          required
                        />

                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                          gap: 2
                        }}>
                          <FormControl fullWidth error={!!errors.type} required>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                              value={formData.type}
                              onChange={(e) => handleChange('type', e.target.value)}
                              label="Tipo"
                            >
                              <MenuItem value="STOCK">Ação</MenuItem>
                              <MenuItem value="FUND">Fundo</MenuItem>
                              <MenuItem value="BOND">Título</MenuItem>
                              <MenuItem value="CRYPTO">Criptomoeda</MenuItem>
                            </Select>
                            {errors.type && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {errors.type}
                              </Typography>
                            )}
                          </FormControl>

                          <TextField
                            fullWidth
                            label="Quantidade"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => handleChange('quantity', e.target.value)}
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            inputProps={{
                              min: 0.01,
                              step: 0.01
                            }}
                            required
                          />

                          <TextField
                            fullWidth
                            label="Preço de Compra"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={(e) => handleChange('purchasePrice', e.target.value)}
                            error={!!errors.purchasePrice}
                            helperText={errors.purchasePrice || 'Preço será preenchido automaticamente'}
                            inputProps={{
                              min: 0.01,
                              step: 0.01
                            }}
                            required
                          />
                        </Box>
                      </Stack>
                    </Box>

                    {/* Resumo */}
                    {totalValue > 0 && (
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Valor Total do Investimento:</strong> {formatters.currency(totalValue)}
                        </Typography>
                        <Typography variant="body2">
                          {formData.quantity} × {formatters.currency(parseFloat(formData.purchasePrice))}
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<Cancel />}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar Investimento'}
                    </Button>
                  </Stack>
                </CardActions>
              </form>
            </Card>
          </Box>

          {/* Painel Lateral - Informações */}
          <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
            <Stack spacing={3}>
              {/* Status da API */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Status da API
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: searchingStock ? 'warning.main' : 'success.main' 
                        }} 
                      />
                      <Typography variant="body2">
                        {searchingStock ? 'Consultando...' : 'Pronto'}
                      </Typography>
                    </Box>
                    
                    {currentQuote && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Última consulta: {currentQuote.symbol}
                        </Typography>
                        <Typography variant="body2">
                          {formatters.currency(currentQuote.price)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Instruções */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Como Usar
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>1.</strong> Digite o símbolo da ação americana (ex: AAPL, MSFT, GOOGL)
                    </Typography>
                    <Typography variant="body2">
                      <strong>2.</strong> Clique em "Buscar" para obter a cotação atual
                    </Typography>
                    <Typography variant="body2">
                      <strong>3.</strong> Os campos Nome e Preço serão preenchidos automaticamente
                    </Typography>
                    <Typography variant="body2">
                      <strong>4.</strong> Ajuste a quantidade e salve o investimento
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Exemplos */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Exemplos de Símbolos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>AAPL</strong> - Apple Inc.
                    </Typography>
                    <Typography variant="body2">
                      <strong>MSFT</strong> - Microsoft Corporation
                    </Typography>
                    <Typography variant="body2">
                      <strong>GOOGL</strong> - Alphabet Inc.
                    </Typography>
                    <Typography variant="body2">
                      <strong>AMZN</strong> - Amazon.com Inc.
                    </Typography>
                    <Typography variant="body2">
                      <strong>TSLA</strong> - Tesla Inc.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>

        {/* Alert de Status */}
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