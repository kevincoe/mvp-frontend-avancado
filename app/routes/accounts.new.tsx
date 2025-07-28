import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Fade,
} from '@mui/material';
import {
  Save,
  Cancel,
  Person,
  AccountBalance,
  Business,
  Phone,
  Email,
  Badge,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { AccountService, type CreateAccountCommand } from '../services/account.service';
import { ValidationService } from '../services/validation';
import { useForm } from '../hooks/useForm';
import { formatters } from '../utils/formatters';
import type { BankAccount } from '../types';

export function meta() {
  return [
    { title: "Nova Conta - Gerente Bancário" },
    { name: "description", content: "Cadastro de nova conta bancária com validação avançada" },
  ];
}

export async function loader() {
  return null;
}

interface FormData extends CreateAccountCommand {}

const ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Poupança', icon: '💰', description: 'Rendimento automático' },
  { value: 'CHECKING', label: 'Conta Corrente', icon: '💳', description: 'Movimentação livre' },
  { value: 'BUSINESS', label: 'Conta Empresarial', icon: '🏢', description: 'Para empresas' },
];

const FORM_STEPS = [
  'Tipo de Conta',
  'Dados Pessoais',
  'Informações da Conta',
  'Confirmação'
];

export default function NewAccount() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [alertState, setAlertState] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Enhanced form with step-by-step validation
  const {
    values: formData,
    errors,
    isSubmitting,
    handleChange: handleFormChange,
    handleSubmit,
    setFieldError,
    validateForm,
    validateField
  } = useForm<FormData>({
    initialValues: {
      customerName: '',
      customerCpf: '',
      customerEmail: '',
      customerPhone: '',
      accountType: 'CHECKING',
      balance: 0,
      businessName: '',
      businessCnpj: '',
      isBusinessAccount: false,
    },
    validationSchema: ValidationService.accountSchema,
    onSubmit: async (values) => {
      await submitAccount(values);
    }
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    handleFormChange(field, value);
    
    // Auto-set business account type when toggled
    if (field === 'isBusinessAccount') {
      if (value) {
        handleFormChange('accountType', 'BUSINESS');
      } else {
        handleFormChange('accountType', 'CHECKING');
        handleFormChange('businessName', '');
        handleFormChange('businessCnpj', '');
      }
    }

    // Real-time validation for current field
    setTimeout(() => validateField(field), 300);
  };

  const submitAccount = async (values: FormData) => {
    try {
      const result = await AccountService.createAccount(values);
      
      if (!result.success) {
        if (result.validationErrors) {
          // Set individual field errors
          Object.entries(result.validationErrors).forEach(([field, error]) => {
            setFieldError(field as keyof FormData, error);
          });
          return;
        }
        
        setAlertState({
          open: true,
          message: result.error || 'Erro ao criar conta',
          severity: 'error',
        });
        return;
      }

      // Success
      setAlertState({
        open: true,
        message: `Conta ${result.account?.accountNumber} criada com sucesso!`,
        severity: 'success',
      });
      
      // Redirect after success
      setTimeout(() => {
        navigate('/accounts');
      }, 2000);
      
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar conta');
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Account Type
        return validateField('accountType');
      case 1: // Personal Data
        return (
          validateField('customerName') &&
          validateField('customerCpf') &&
          validateField('customerEmail') &&
          validateField('customerPhone') &&
          (!formData.isBusinessAccount || (
            validateField('businessName') &&
            validateField('businessCnpj')
          ))
        );
      case 2: // Account Info
        return validateField('balance');
      default:
        return true;
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  // Format helpers
  const formatDocument = (value: string, isCnpj: boolean = false) => {
    const digits = value.replace(/\D/g, '');
    if (isCnpj) {
      return formatters.cnpj(digits);
    } else {
      return formatters.cpf(digits);
    }
  };

  const formatPhone = (value: string) => {
    return formatters.phone(value);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={300}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom>
                Selecione o Tipo de Conta
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isBusinessAccount}
                    onChange={(e) => handleInputChange('isBusinessAccount', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business />
                    <Typography variant="body1">Conta Empresarial</Typography>
                  </Box>
                }
              />

              <FormControl fullWidth error={!!errors.accountType}>
                <InputLabel>Tipo de Conta *</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  label="Tipo de Conta *"
                  disabled={formData.isBusinessAccount}
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                        <Box>
                          <Typography variant="body1">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.accountType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.accountType}
                  </Typography>
                )}
              </FormControl>
            </Stack>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={300}>
            <Stack spacing={3}>
              {/* Business Information */}
              {formData.isBusinessAccount && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business />
                    Dados da Empresa
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2
                  }}>
                    <TextField
                      fullWidth
                      label="Razão Social *"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      error={!!errors.businessName}
                      helperText={errors.businessName}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="CNPJ *"
                      value={formatDocument(formData.businessCnpj || '', true)}
                      onChange={(e) => handleInputChange('businessCnpj', e.target.value)}
                      error={!!errors.businessCnpj}
                      helperText={errors.businessCnpj}
                      inputProps={{
                        maxLength: 18,
                        placeholder: '00.000.000/0000-00'
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Badge />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Divider />
                </>
              )}

              {/* Personal Information */}
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person />
                Dados do {formData.isBusinessAccount ? 'Responsável' : 'Cliente'}
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2
              }}>
                <TextField
                  fullWidth
                  label={`${formData.isBusinessAccount ? 'Nome do Responsável' : 'Nome Completo'} *`}
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  error={!!errors.customerName}
                  helperText={errors.customerName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="CPF *"
                  value={formatDocument(formData.customerCpf)}
                  onChange={(e) => handleInputChange('customerCpf', e.target.value)}
                  error={!!errors.customerCpf}
                  helperText={errors.customerCpf}
                  inputProps={{
                    maxLength: 14,
                    placeholder: '000.000.000-00'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="E-mail *"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Telefone *"
                  value={formatPhone(formData.customerPhone)}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  error={!!errors.customerPhone}
                  helperText={errors.customerPhone}
                  inputProps={{
                    maxLength: 15,
                    placeholder: '(00) 00000-0000'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Stack>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={300}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalance />
                Informações da Conta
              </Typography>
              
              <TextField
                fullWidth
                label="Saldo Inicial *"
                type="number"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                error={!!errors.balance}
                helperText={errors.balance || 'Valor mínimo: R$ 0,00'}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      R$
                    </InputAdornment>
                  ),
                }}
              />

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Informações importantes:</strong>
                </Typography>
                <Typography variant="body2">
                  • O número da conta será gerado automaticamente
                </Typography>
                <Typography variant="body2">
                  • A conta será criada com status "Ativa"
                </Typography>
                <Typography variant="body2">
                  • {formData.isBusinessAccount ? 'Contas empresariais' : 'Contas pessoais'} têm funcionalidades específicas
                </Typography>
              </Alert>
            </Stack>
          </Fade>
        );

      case 3:
        return (
          <Fade in timeout={300}>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle />
                Confirmação dos Dados
              </Typography>
              
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tipo de Conta
                      </Typography>
                      <Typography variant="body1">
                        {ACCOUNT_TYPES.find(type => type.value === formData.accountType)?.label}
                        {formData.isBusinessAccount && ' (Empresarial)'}
                      </Typography>
                    </Box>

                    {formData.isBusinessAccount && (
                      <>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Empresa
                          </Typography>
                          <Typography variant="body1">
                            {formData.businessName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            CNPJ: {formatDocument(formData.businessCnpj || '', true)}
                          </Typography>
                        </Box>
                      </>
                    )}

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {formData.isBusinessAccount ? 'Responsável' : 'Cliente'}
                      </Typography>
                      <Typography variant="body1">
                        {formData.customerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        CPF: {formatDocument(formData.customerCpf)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        E-mail: {formData.customerEmail}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Telefone: {formatPhone(formData.customerPhone)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Saldo Inicial
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatters.currency(formData.balance)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Atenção:</strong> Verifique todos os dados antes de confirmar. 
                  Após a criação, alguns dados não poderão ser alterados.
                </Typography>
              </Alert>
            </Stack>
          </Fade>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <AccountBalance sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4">
            Nova Conta Bancária
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {FORM_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card>
          {isSubmitting && (
            <LoadingSpinner 
              loading={true} 
              message="Criando conta..."
              variant="backdrop"
              fullScreen={false}
            />
          )}
          
          <form onSubmit={handleSubmit}>
            <CardContent sx={{ minHeight: 400 }}>
              {renderStepContent(activeStep)}
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between', p: 3 }}>
              <Box>
                {activeStep > 0 && (
                  <Button
                    onClick={handleBack}
                    startIcon={<NavigateBefore />}
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<Cancel />}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                {activeStep === FORM_STEPS.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Conta'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    endIcon={<NavigateNext />}
                    disabled={isSubmitting}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </CardActions>
          </form>
        </Card>

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