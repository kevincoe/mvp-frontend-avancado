// Componente LoadingSpinner reutilizável

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Fade,
  Paper,
  LinearProgress,
} from '@mui/material';

interface LoadingSpinnerProps {
  loading: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear' | 'backdrop';
  color?: 'primary' | 'secondary' | 'inherit';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loading,
  message = 'Carregando...',
  size = 'medium',
  variant = 'circular',
  color = 'primary',
  fullScreen = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 40;
      case 'large':
        return 60;
      default:
        return 40;
    }
  };

  if (!loading) return null;

  // Backdrop para tela cheia
  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" size={getSize()} />
        {message && (
          <Typography variant="body1" color="inherit">
            {message}
          </Typography>
        )}
      </Backdrop>
    );
  }

  // Variante linear
  if (variant === 'linear') {
    return (
      <Fade in={loading}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress color={color} />
          {message && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1, textAlign: 'center' }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  // Variante backdrop local
  if (variant === 'backdrop') {
    return (
      <Fade in={loading}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000,
            gap: 2,
          }}
        >
          <CircularProgress color={color} size={getSize()} />
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  // Variante circular padrão
  return (
    <Fade in={loading}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 4,
        }}
      >
        <CircularProgress color={color} size={getSize()} />
        {message && (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};

// Componente para loading em cards
interface LoadingCardProps {
  loading: boolean;
  message?: string;
  height?: number | string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  loading,
  message = 'Carregando...',
  height = 200,
}) => {
  if (!loading) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );
};

// Componente para loading em linha (inline)
interface InlineLoadingProps {
  loading: boolean;
  message?: string;
  size?: number;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  loading,
  message,
  size = 16,
}) => {
  if (!loading) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

// Componente para loading em botões
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  size?: number;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  size = 16,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {loading && <CircularProgress size={size} />}
      {children}
    </Box>
  );
};

// Componente para skeleton loading
interface SkeletonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  loading,
  children,
  variant = 'rectangular',
  width = '100%',
  height = 40,
}) => {
  if (!loading) return <>{children}</>;

  return (
    <Box
      sx={{
        width,
        height,
        bgcolor: 'grey.200',
        borderRadius: variant === 'circular' ? '50%' : 1,
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
          '100%': {
            opacity: 1,
          },
        },
      }}
    />
  );
};

// Hook para gerenciar estado de loading
export const useLoading = (initialState: boolean = false) => {
  const [loading, setLoading] = React.useState(initialState);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const toggleLoading = () => setLoading(!loading);

  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    setLoading,
  };
};

export default LoadingSpinner;
