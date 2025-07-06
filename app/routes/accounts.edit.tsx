import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
} from '@mui/material';
import {
  Save,
  Cancel,
  Person,
  AccountBalance,
  ArrowBack,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { StorageService } from '../services/storage';
import { formatters, validators } from '../utils/formatters';
import type { BankAccount } from '../types';

export function meta() {
  return [
    { title: "Editar Conta - Gerente Bancário" },
    { name: "description", content: "Edição de conta bancária" },
  ];
}

interface FormData {
  customerName: string;
  customerCpf: string;
  customerEmail: string;
  customerPhone: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'BUSINESS';
  balance: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

interface FormErrors {
  customerName?: string;
  customerCpf?: string;
  customerEmail?: string;
  customerPhone?: string;
  accountType?: string;
  balance?: string;
  status?: string;
}

export default function EditAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerCpf: '',
    customerEmail: '',
    customerPhone: '',
    accountType: 'CHECKING',
    balance: '0',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadAccount();
  }, [id]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError('ID da conta não fornecido');
        return;
      }

      const accounts = StorageService.getAccounts();
      const foundAccount = accounts.find(acc => acc.id === id);
      
      if (!foundAccount) {
        setError('Conta não encontrada');
        return;
      }

      setAccount(foundAccount);
      setFormData({
        customerName: foundAccount.customerName,
        customerCpf: foundAccount.customerCpf,
        customerEmail: foundAccount.customerEmail,
        customerPhone: foundAccount.customerPhone,
        accountType: foundAccount.accountType,
        balance: foundAccount.balance.toString(),
        status: foundAccount.status,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conta');
    } finally {
      setLoading(false);
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Nome é obrigatório';
    }

    if (!formData.customerCpf.trim()) {
      newErrors.customerCpf = 'CPF é obrigatório';
    } else if (!validators.cpf(formData.customerCpf)) {
      newErrors.customerCpf = 'CPF inválido';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email é obrigatório';
    } else if (!validators.email(formData.customerEmail)) {
      newErrors.customerEmail = 'Email inválido';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Telefone é obrigatório';
    } else if (!validators.phone(formData.customerPhone)) {
      newErrors.customerPhone = 'Telefone inválido';
    }

    const balanceValue = parseFloat(formData.balance);
    if (isNaN(balanceValue) || balanceValue < 0) {
      newErrors.balance = 'Saldo deve ser um valor válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !account) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Verificar se CPF já existe em outra conta
      const existingAccounts = StorageService.getAccounts();
      const cpfExists = existingAccounts.some(acc => 
        acc.customerCpf === formData.customerCpf && acc.id !== account.id
      );
      
      if (cpfExists) {
        setError('Já existe outra conta cadastrada com este CPF');
        return;
      }

      const updatedAccount: BankAccount = {
        ...account,
        customerName: formData.customerName.trim(),
        customerCpf: formData.customerCpf.replace(/\D/g, ''),
        customerEmail: formData.customerEmail.trim().toLowerCase(),
        customerPhone: formData.customerPhone.replace(/\D/g, ''),
        accountType: formData.accountType,
        balance: parseFloat(formData.balance),
        status: formData.status,
        updatedAt: new Date(),
      };

      const updatedAccounts = existingAccounts.map(acc => 
        acc.id === account.id ? updatedAccount : acc
      );
      
      StorageService.saveAccounts(updatedAccounts);
      
      navigate(`/accounts/${account.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar conta');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/accounts/${id}`);
  };

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

  if (error || !account) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Header />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Conta não encontrada'}
          </Alert>
          <Button
            onClick={() => navigate('/accounts')}
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Voltar para Contas
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            onClick={() => navigate(`/accounts/${id}`)}
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <AccountBalance sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4">
              Editar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conta: {account.accountNumber}
            </Typography>
          </Box>
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
                {/* Dados do Cliente */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    Dados do Cliente
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      value={formData.customerName}
                      onChange={(e) => handleChange('customerName', e.target.value)}
                      error={!!errors.customerName}
                      helperText={errors.customerName}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="CPF"
                      value={formatters.cpf(formData.customerCpf)}
                      onChange={(e) => handleChange('customerCpf', e.target.value)}
                      error={!!errors.customerCpf}
                      helperText={errors.customerCpf}
                      inputProps={{
                        maxLength: 14,
                        placeholder: '000.000.000-00'
                      }}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleChange('customerEmail', e.target.value)}
                      error={!!errors.customerEmail}
                      helperText={errors.customerEmail}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formatters.phone(formData.customerPhone)}
                      onChange={(e) => handleChange('customerPhone', e.target.value)}
                      error={!!errors.customerPhone}
                      helperText={errors.customerPhone}
                      inputProps={{
                        maxLength: 15,
                        placeholder: '(11) 99999-9999'
                      }}
                      required
                    />
                  </Box>
                </Box>

                {/* Dados da Conta */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance sx={{ mr: 1 }} />
                    Dados da Conta
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                    gap: 2
                  }}>
                    <FormControl fullWidth error={!!errors.accountType} required>
                      <InputLabel>Tipo de Conta</InputLabel>
                      <Select
                        value={formData.accountType}
                        onChange={(e) => handleChange('accountType', e.target.value)}
                        label="Tipo de Conta"
                      >
                        <MenuItem value="SAVINGS">Poupança</MenuItem>
                        <MenuItem value="CHECKING">Conta Corrente</MenuItem>
                        <MenuItem value="BUSINESS">Conta Empresarial</MenuItem>
                      </Select>
                      {errors.accountType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.accountType}
                        </Typography>
                      )}
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Saldo"
                      type="number"
                      value={formData.balance}
                      onChange={(e) => handleChange('balance', e.target.value)}
                      error={!!errors.balance}
                      helperText={errors.balance}
                      inputProps={{
                        min: 0,
                        step: 0.01
                      }}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="ACTIVE">Ativa</MenuItem>
                        <MenuItem value="INACTIVE">Inativa</MenuItem>
                        <MenuItem value="BLOCKED">Bloqueada</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Informações Adicionais */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Informações:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • Todos os campos marcados com * são obrigatórios
                  </Typography>
                  <Typography variant="body2">
                    • O CPF deve ser único no sistema
                  </Typography>
                  <Typography variant="body2">
                    • A alteração será salva imediatamente
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
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <LoadingSpinner loading={true} /> : <Save />}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Stack>
            </CardActions>
          </form>
        </Card>
      </Container>
    </Box>
  );
}
