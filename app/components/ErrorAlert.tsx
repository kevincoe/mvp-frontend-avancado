// Componente ErrorAlert reutilizável

import React from 'react';
import {
  Alert,
  AlertTitle,
  Snackbar,
  Box,
  Typography,
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import type { AlertColor } from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface ErrorAlertProps {
  open: boolean;
  message: string;
  title?: string;
  severity?: AlertColor;
  variant?: 'filled' | 'outlined' | 'standard';
  onClose?: () => void;
  onRetry?: () => void;
  autoHideDuration?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  details?: string;
  persistent?: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  open,
  message,
  title,
  severity = 'error',
  variant = 'filled',
  onClose,
  onRetry,
  autoHideDuration = 6000,
  position = { vertical: 'top', horizontal: 'center' },
  details,
  persistent = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' && persistent) {
      return;
    }
    onClose?.();
  };

  const handleRetry = () => {
    onRetry?.();
    onClose?.();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={persistent ? null : autoHideDuration}
      onClose={handleClose}
      anchorOrigin={position}
      sx={{ maxWidth: '90vw' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant={variant}
        sx={{
          width: '100%',
          minWidth: 300,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {details && (
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            {onRetry && (
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
              >
                Tentar novamente
              </Button>
            )}
            {onClose && (
              <IconButton
                size="small"
                color="inherit"
                onClick={() => onClose()}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        <Typography variant="body2">{message}</Typography>
        
        {details && (
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.1)', borderRadius: 1 }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {details}
              </Typography>
            </Box>
          </Collapse>
        )}
      </Alert>
    </Snackbar>
  );
};

// Componente para alerta inline
interface InlineAlertProps {
  show: boolean;
  message: string;
  title?: string;
  severity?: AlertColor;
  variant?: 'filled' | 'outlined' | 'standard';
  onClose?: () => void;
  onRetry?: () => void;
  fullWidth?: boolean;
  sx?: any;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  show,
  message,
  title,
  severity = 'error',
  variant = 'outlined',
  onClose,
  onRetry,
  fullWidth = true,
  sx,
}) => {
  if (!show) return null;

  return (
    <Alert
      severity={severity}
      variant={variant}
      onClose={onClose}
      sx={{
        width: fullWidth ? '100%' : 'auto',
        ...sx,
      }}
      action={
        onRetry && (
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
          >
            Tentar novamente
          </Button>
        )
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
};

// Componente para alertas de validação
interface ValidationAlertProps {
  errors: string[];
  show: boolean;
  onClose?: () => void;
  title?: string;
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({
  errors,
  show,
  onClose,
  title = 'Corrija os seguintes erros:',
}) => {
  if (!show || errors.length === 0) return null;

  return (
    <Alert
      severity="warning"
      variant="outlined"
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      <AlertTitle>{title}</AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {errors.map((error, index) => (
          <Typography key={index} component="li" variant="body2">
            {error}
          </Typography>
        ))}
      </Box>
    </Alert>
  );
};

// Componente para alertas de confirmação
interface ConfirmationAlertProps {
  show: boolean;
  message: string;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: AlertColor;
}

export const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  show,
  message,
  title,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning',
}) => {
  if (!show) return null;

  return (
    <Alert
      severity={severity}
      variant="outlined"
      sx={{ mb: 2 }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            size="small"
            onClick={onConfirm}
            variant="contained"
          >
            {confirmText}
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={onCancel}
            variant="outlined"
          >
            {cancelText}
          </Button>
        </Box>
      }
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
};

// Hook para gerenciar alertas
export const useAlert = () => {
  const [alert, setAlert] = React.useState<{
    open: boolean;
    message: string;
    title?: string;
    severity?: AlertColor;
    details?: string;
  }>({
    open: false,
    message: '',
  });

  const showAlert = (
    message: string,
    severity: AlertColor = 'error',
    title?: string,
    details?: string
  ) => {
    setAlert({
      open: true,
      message,
      title,
      severity,
      details,
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const showError = (message: string, title?: string, details?: string) => {
    showAlert(message, 'error', title, details);
  };

  const showSuccess = (message: string, title?: string) => {
    showAlert(message, 'success', title);
  };

  const showWarning = (message: string, title?: string) => {
    showAlert(message, 'warning', title);
  };

  const showInfo = (message: string, title?: string) => {
    showAlert(message, 'info', title);
  };

  return {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
};

export default ErrorAlert;
