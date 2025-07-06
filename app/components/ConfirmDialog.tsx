// Componente ConfirmDialog reutilizável

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Transição para o diálogo
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'warning' | 'info' | 'success' | 'error';
  showIcon?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
  variant = 'warning',
  showIcon = true,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClick = false,
  loading = false,
  children,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <WarningIcon color="warning" sx={{ fontSize: 48 }} />;
      case 'info':
        return <InfoIcon color="info" sx={{ fontSize: 48 }} />;
      case 'success':
        return <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />;
      case 'error':
        return <ErrorIcon color="error" sx={{ fontSize: 48 }} />;
      default:
        return <WarningIcon color="warning" sx={{ fontSize: 48 }} />;
    }
  };

  const handleClose = (event: any, reason: string) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={Transition}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          {title}
        </Typography>
        <IconButton
          aria-label="fechar"
          onClick={onCancel}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 2,
          }}
        >
          {showIcon && (
            <Box sx={{ mb: 2 }}>
              {getIcon()}
            </Box>
          )}
          
          <Typography
            id="confirm-dialog-description"
            variant="body1"
            sx={{ mb: 2 }}
          >
            {message}
          </Typography>

          {children && (
            <Box sx={{ width: '100%', mt: 2 }}>
              {children}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onCancel}
          color="inherit"
          variant="outlined"
          disabled={loading}
          sx={{ mr: 1 }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? 'Processando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Versão simplificada para confirmação de exclusão
interface DeleteConfirmDialogProps {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <ConfirmDialog
      open={open}
      title="Confirmar Exclusão"
      message={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Excluir"
      cancelText="Cancelar"
      confirmColor="error"
      variant="error"
      loading={loading}
    />
  );
};

// Versão para confirmação de ações importantes
interface ActionConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  actionName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  variant?: 'warning' | 'info' | 'success' | 'error';
}

export const ActionConfirmDialog: React.FC<ActionConfirmDialogProps> = ({
  open,
  title,
  message,
  actionName,
  onConfirm,
  onCancel,
  loading = false,
  variant = 'warning',
}) => {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText={actionName}
      cancelText="Cancelar"
      confirmColor={variant === 'error' ? 'error' : 'primary'}
      variant={variant}
      loading={loading}
    />
  );
};

// Hook para gerenciar diálogos de confirmação
export const useConfirmDialog = () => {
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'warning' | 'info' | 'success' | 'error';
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant: 'warning' | 'info' | 'success' | 'error' = 'warning'
  ) => {
    setDialog({
      open: true,
      title,
      message,
      onConfirm,
      variant,
    });
  };

  const hideDialog = () => {
    setDialog(prev => ({ ...prev, open: false }));
  };

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    showDialog(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
      onConfirm,
      'error'
    );
  };

  return {
    dialog,
    showDialog,
    hideDialog,
    confirmDelete,
  };
};

export default ConfirmDialog;
