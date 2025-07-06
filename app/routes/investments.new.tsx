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
  Autocomplete,
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
import { formatters, validators } from '../utils/formatters';
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

// Símbolos populares para sugestão
const popularSymbols = [
  { symbol: 'PETR4', name: 'Petrobras PN' },
  { symbol: 'VALE3', name: 'Vale ON' },
  { symbol: 'ITUB4', name: 'Itaú Unibanco PN' },
  { symbol: 'BBDC4', name: 'Bradesco PN' },
  { symbol: 'ABEV3', name: 'Ambev ON' },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON' },
  { symbol: 'WEGE3', name: 'WEG ON' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
];

export default function NewInvestment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [searchingStock, setSearchingStock] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountId: '',
    symbol: '',
    name: '',
    type: '',
    quantity: '1',
    purchasePrice: '0',
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
    if (!symbol.trim()) return;

    try {
      setSearchingStock(true);
      
      // Primeiro verificar se é um símbolo popular
      const popularStock = popularSymbols.find(
        stock => stock.symbol.toLowerCase() === symbol.toLowerCase()
      );
      
      if (popularStock) {
        setFormData(prev => ({
          ...prev,
          name: popularStock.name,
          type: symbol.includes('3') || symbol.includes('4') ? 'STOCK' : 'STOCK',
        }));
        return;
      }

      // Tentar buscar cotação real (pode falhar se API não estiver disponível)
      try {
        const response = await FinanceService.getStockQuote(symbol);
        if (response.success && response.data) {
          setFormData(prev => ({
            ...prev,
            name: response.data!.name || symbol,
            purchasePrice: response.data!.price.toString(),
            type: 'STOCK',
          }));
        }
      } catch {
        // Se falhar, usar dados padrão
        setFormData(prev => ({
          ...prev,
          name: symbol,
          type: 'STOCK',
        }));
      }
    } catch (err) {
      console.warn('Erro ao buscar ação:', err);
    } finally {
      setSearchingStock(false);
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

  const handleSymbolSelect = (symbol: string) => {
    setFormData(prev => ({ ...prev, symbol }));
    searchStock(symbol);
  };

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
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                      <Autocomplete
                        freeSolo
                        options={popularSymbols.map(stock => stock.symbol)}
                        value={formData.symbol}
                        onInputChange={(event, newValue) => {
                          handleChange('symbol', newValue || '');
                        }}
                        onChange={(event, newValue) => {
                          if (newValue) {
                            handleSymbolSelect(newValue);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Símbolo"
                            error={!!errors.symbol}
                            helperText={errors.symbol || 'Ex: PETR4, AAPL, VALE3'}
                            required
                            sx={{ flexGrow: 1 }}
                          />
                        )}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => searchStock(formData.symbol)}
                        disabled={!formData.symbol || searchingStock}
                        startIcon={searchingStock ? <LoadingSpinner loading={true} /> : <Search />}
                      >
                        Buscar
                      </Button>
                    </Box>

                    <TextField
                      fullWidth
                      label="Nome do Investimento"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
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
                        helperText={errors.purchasePrice}
                        inputProps={{
                          min: 0.01,
                          step: 0.01
                        }}
                        required
                      />
                    </Box>
                  </Stack>
                </Box>

                {/* Símbolos Populares */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Símbolos Populares
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {popularSymbols.slice(0, 8).map((stock) => (
                      <Button
                        key={stock.symbol}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSymbolSelect(stock.symbol)}
                      >
                        {stock.symbol}
                      </Button>
                    ))}
                  </Box>
                </Box>

                {/* Informações Adicionais */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Informações:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Use a busca para encontrar informações atualizadas do investimento
                  </Typography>
                  <Typography variant="body2">
                    • O preço atual será igual ao preço de compra inicialmente
                  </Typography>
                  <Typography variant="body2">
                    • Todos os campos marcados com * são obrigatórios
                  </Typography>
                </Alert>
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
                  startIcon={loading ? <LoadingSpinner loading={true} /> : <Save />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Investimento'}
                </Button>
              </Stack>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
