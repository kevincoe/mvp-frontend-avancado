export async function loader() {
  return null;
}

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
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
  Avatar,
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchField from '../components/SearchField';
import { StorageService } from '../services/storage';
import { formatters } from '../utils/formatters';
import type { Investment, BankAccount } from '../types';

export function meta() {
  return [
    { title: "Investimentos - Gerente Bancário" },
    { name: "description", content: "Gerenciamento de investimentos" },
  ];
}

export default function Investments() {
  const [searchParams] = useSearchParams();
  const accountIdFilter = searchParams.get('accountId');
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [filteredInvestments, setFilteredInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);

  useEffect(() => {
    loadInvestments();
  }, []);

  useEffect(() => {
    filterInvestments();
  }, [investments, searchTerm, accountIdFilter]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const investmentsData = StorageService.getInvestments();
      const accountsData = StorageService.getAccounts();
      
      setInvestments(investmentsData);
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar investimentos');
    } finally {
      setLoading(false);
    }
  };

  const filterInvestments = () => {
    let filtered = investments;

    // Filtrar por conta específica se fornecida
    if (accountIdFilter) {
      filtered = filtered.filter(inv => inv.accountId === accountIdFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(investment =>
        investment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investment.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvestments(filtered);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, investment: Investment) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvestment(investment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInvestment(null);
  };

  const handleDeleteClick = (investment: Investment) => {
    setInvestmentToDelete(investment);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!investmentToDelete) return;

    try {
      const updatedInvestments = investments.filter(inv => inv.id !== investmentToDelete.id);
      StorageService.saveInvestments(updatedInvestments);
      setInvestments(updatedInvestments);
      setDeleteDialogOpen(false);
      setInvestmentToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir investimento');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'STOCK':
        return 'Ação';
      case 'FUND':
        return 'Fundo';
      case 'BOND':
        return 'Título';
      case 'CRYPTO':
        return 'Cripto';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STOCK':
        return 'primary';
      case 'FUND':
        return 'secondary';
      case 'BOND':
        return 'success';
      case 'CRYPTO':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.customerName : 'Conta não encontrada';
  };

  const getAccountNumber = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.accountNumber : '';
  };

  const calculateProfit = (investment: Investment) => {
    const currentValue = investment.quantity * investment.currentPrice;
    const purchaseValue = investment.quantity * investment.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateProfitPercentage = (investment: Investment) => {
    const profit = calculateProfit(investment);
    const purchaseValue = investment.quantity * investment.purchasePrice;
    return purchaseValue > 0 ? (profit / purchaseValue) * 100 : 0;
  };

  const totalInvestmentValue = filteredInvestments.reduce((sum, inv) => sum + (inv.quantity * inv.currentPrice), 0);
  const totalProfit = filteredInvestments.reduce((sum, inv) => sum + calculateProfit(inv), 0);

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
            Investimentos
          </Typography>
          <Button
            component={Link}
            to="/investments/new"
            variant="contained"
            startIcon={<Add />}
          >
            Novo Investimento
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

        {/* Resumo */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3
        }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {formatters.currency(totalInvestmentValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: totalProfit >= 0 ? 'success.main' : 'error.main', mr: 2 }}>
                  {totalProfit >= 0 ? <TrendingUp /> : <TrendingDown />}
                </Avatar>
                <Box>
                  <Typography variant="h6" color={totalProfit >= 0 ? 'success.main' : 'error.main'}>
                    {formatters.currency(totalProfit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lucro/Prejuízo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <AccountBalance />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {filteredInvestments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Investimentos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1 }}>
                <SearchField
                  placeholder="Buscar por símbolo, nome ou tipo..."
                  value={searchTerm}
                  onChange={(value) => setSearchTerm(value)}
                />
              </Box>
              {accountIdFilter && (
                <Chip
                  label={`Conta: ${getAccountNumber(accountIdFilter)}`}
                  onDelete={() => window.location.href = '/investments'}
                  color="primary"
                />
              )}
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

        {/* Lista de Investimentos */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total: {filteredInvestments.length} investimento(s)
            </Typography>
            
            {filteredInvestments.length === 0 ? (
              <Alert severity="info">
                {searchTerm ? 'Nenhum investimento encontrado com os critérios de busca.' : 'Nenhum investimento cadastrado ainda.'}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Símbolo</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço Atual</TableCell>
                      <TableCell align="right">Valor Total</TableCell>
                      <TableCell align="right">Lucro/Prejuízo</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInvestments.map((investment) => {
                      const profit = calculateProfit(investment);
                      const profitPercentage = calculateProfitPercentage(investment);
                      
                      return (
                        <TableRow key={investment.id} hover>
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
                          <TableCell>
                            <Chip
                              label={getTypeLabel(investment.type)}
                              color={getTypeColor(investment.type) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {getAccountName(investment.accountId)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getAccountNumber(investment.accountId)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatters.number(investment.quantity)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatters.currency(investment.currentPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold">
                              {formatters.currency(investment.quantity * investment.currentPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography 
                                variant="body2" 
                                color={profit >= 0 ? 'success.main' : 'error.main'}
                                fontWeight="bold"
                              >
                                {formatters.currency(profit)}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color={profit >= 0 ? 'success.main' : 'error.main'}
                              >
                                {profit >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={(e) => handleMenuClick(e, investment)}
                              size="small"
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
            to={`/investments/${selectedInvestment?.id}`}
            onClick={handleMenuClose}
          >
            <Visibility sx={{ mr: 1 }} />
            Visualizar
          </MenuItem>
          <MenuItem
            component={Link}
            to={`/investments/${selectedInvestment?.id}/edit`}
            onClick={handleMenuClose}
          >
            <Edit sx={{ mr: 1 }} />
            Editar
          </MenuItem>
          <MenuItem
            onClick={() => selectedInvestment && handleDeleteClick(selectedInvestment)}
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
          message={`Tem certeza que deseja excluir o investimento ${investmentToDelete?.symbol}?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteDialogOpen(false);
            setInvestmentToDelete(null);
          }}
        />

        {/* Botão Flutuante */}
        <Fab
          color="primary"
          aria-label="add"
          component={Link}
          to="/investments/new"
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
