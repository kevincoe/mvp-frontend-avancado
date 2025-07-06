import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Stack,
  Alert,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  ArrowBack,
  Person,
  AccountBalance,
  Email,
  Phone,
  CalendarToday,
  MoreVert,
  TrendingUp,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import { StorageService } from '../services/storage';
import { formatters } from '../utils/formatters';
import type { BankAccount, Investment } from '../types';

export function meta() {
  return [
    { title: "Detalhes da Conta - Gerente Bancário" },
    { name: "description", content: "Detalhes da conta bancária" },
  ];
}

export default function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

      // Carregar investimentos relacionados
      const allInvestments = StorageService.getInvestments();
      const accountInvestments = allInvestments.filter(inv => inv.accountId === id);
      setInvestments(accountInvestments);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!account) return;

    try {
      const accounts = StorageService.getAccounts();
      const updatedAccounts = accounts.filter(acc => acc.id !== account.id);
      StorageService.saveAccounts(updatedAccounts);
      
      // Remover investimentos relacionados
      const allInvestments = StorageService.getInvestments();
      const updatedInvestments = allInvestments.filter(inv => inv.accountId !== account.id);
      StorageService.saveInvestments(updatedInvestments);
      
      navigate('/accounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'default';
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'INACTIVE':
        return 'Inativa';
      case 'BLOCKED':
        return 'Bloqueada';
      default:
        return status;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'SAVINGS':
        return 'Poupança';
      case 'CHECKING':
        return 'Conta Corrente';
      case 'BUSINESS':
        return 'Conta Empresarial';
      default:
        return type;
    }
  };

  const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);

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
            component={Link}
            to="/accounts"
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
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              component={Link}
              to="/accounts"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{ mr: 2 }}
            >
              Voltar
            </Button>
            <Typography variant="h4">
              Detalhes da Conta
            </Typography>
          </Box>
          <IconButton onClick={handleMenuClick}>
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3
        }}>
          {/* Informações da Conta */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {account.customerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conta: {account.accountNumber}
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>CPF:</strong> {formatters.cpf(account.customerCpf)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Email:</strong> {account.customerEmail}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Telefone:</strong> {formatters.phone(account.customerPhone)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Tipo:</strong> {getAccountTypeLabel(account.accountType)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>Criada em:</strong> {formatters.date(account.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    <strong>Status:</strong>
                  </Typography>
                  <Chip
                    label={getStatusLabel(account.status)}
                    color={getStatusColor(account.status) as any}
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumo Financeiro
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Saldo em Conta
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                      {formatters.currency(account.balance)}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Investimentos
                    </Typography>
                    <Typography variant="h5" color="info.main" fontWeight="bold">
                      {formatters.currency(totalInvestmentValue)}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Patrimônio Total
                    </Typography>
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatters.currency(account.balance + totalInvestmentValue)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investimentos
                </Typography>
                {investments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum investimento cadastrado
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {investments.slice(0, 3).map((investment) => (
                      <Box key={investment.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {investment.symbol}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatters.currency(investment.quantity * investment.currentPrice)}
                        </Typography>
                      </Box>
                    ))}
                    {investments.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{investments.length - 3} mais
                      </Typography>
                    )}
                  </Stack>
                )}
                <Button
                  component={Link}
                  to={`/investments?accountId=${account.id}`}
                  variant="outlined"
                  size="small"
                  startIcon={<TrendingUp />}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Ver Investimentos
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Menu de Ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            component={Link}
            to={`/accounts/${account.id}/edit`}
            onClick={handleMenuClose}
          >
            <Edit sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
        </Menu>

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a conta ${account.accountNumber} de ${account.customerName}? Esta ação também excluirá todos os investimentos relacionados.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteDialogOpen(false)}
        />
      </Container>
    </Box>
  );
}
