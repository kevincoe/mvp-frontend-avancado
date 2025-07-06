export async function loader() {
  return null;
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Stack,
  Fab,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchField from '../components/SearchField';
import { StorageService } from '../services/storage';
import { formatters } from '../utils/formatters';
import type { BankAccount } from '../types';

export function meta() {
  return [
    { title: "Contas Bancárias - Gerente Bancário" },
    { name: "description", content: "Gerenciamento de contas bancárias" },
  ];
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados locais
      const accountsData = StorageService.getAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    if (!searchTerm) {
      setFilteredAccounts(accounts);
      return;
    }

    const filtered = accounts.filter(account =>
      account.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      account.customerCpf.includes(searchTerm) ||
      account.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredAccounts(filtered);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, account: BankAccount) => {
    setAnchorEl(event.currentTarget);
    setSelectedAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAccount(null);
  };

  const handleDeleteClick = (account: BankAccount) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;

    try {
      const updatedAccounts = accounts.filter(acc => acc.id !== accountToDelete.id);
      StorageService.saveAccounts(updatedAccounts);
      setAccounts(updatedAccounts);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
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
        return 'Corrente';
      case 'BUSINESS':
        return 'Empresarial';
      default:
        return type;
    }
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

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Contas Bancárias
          </Typography>
          <Button
            component={Link}
            to="/accounts/new"
            variant="contained"
            startIcon={<Add />}
          >
            Nova Conta
          </Button>
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

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1 }}>
                <SearchField
                  placeholder="Buscar por nome, CPF, email ou número da conta..."
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  // Implementar filtros avançados se necessário
                }}
              >
                Filtros
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total: {filteredAccounts.length} conta(s)
            </Typography>
            
            {filteredAccounts.length === 0 ? (
              <Alert severity="info">
                {searchTerm ? 'Nenhuma conta encontrada com os critérios de busca.' : 'Nenhuma conta cadastrada ainda.'}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Conta</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell>Criado em</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {account.customerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatters.cpf(account.customerCpf)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {account.accountNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getAccountTypeLabel(account.accountType)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            {formatters.currency(account.balance)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusLabel(account.status)}
                            color={getStatusColor(account.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatters.date(account.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleMenuClick(e, account)}
                            size="small"
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Menu de Ações */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            component={Link}
            to={`/accounts/${selectedAccount?.id}`}
            onClick={handleMenuClose}
          >
            <Visibility sx={{ mr: 1 }} />
            Visualizar
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/accounts/${selectedAccount?.id}/edit`}
            onClick={handleMenuClose}
          >
            <Edit sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() => selectedAccount && handleDeleteClick(selectedAccount)}
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
          message={`Tem certeza que deseja excluir a conta ${accountToDelete?.accountNumber} de ${accountToDelete?.customerName}?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setAccountToDelete(null);
          }}
        />

        {/* Botão Flutuante */}
        <Fab
          color="primary"
          aria-label="add"
          component={Link}
          to="/accounts/new"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      </Container>
    </Box>
  );
}
