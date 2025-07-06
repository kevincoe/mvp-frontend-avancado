// Componente CustomButton reutilizável

import React from 'react';
import {
  Button,
  IconButton,
  Fab,
  ButtonGroup,
  Box,
  CircularProgress,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import { keyframes } from '@mui/system';

// Animações
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

// Styled components
const AnimatedButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'animate',
})<{ animate?: 'pulse' | 'shake' | 'bounce' }>(({ theme, animate }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  ...(animate === 'pulse' && {
    animation: `${pulseAnimation} 2s infinite`,
  }),
  ...(animate === 'shake' && {
    animation: `${shakeAnimation} 0.5s ease-in-out`,
  }),
  ...(animate === 'bounce' && {
    animation: `${bounceAnimation} 1s ease-in-out`,
  }),
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  border: 0,
  borderRadius: 8,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  '&:hover': {
    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
  },
}));

const GlowButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: 8,
  '&:hover': {
    background: 'transparent',
    color: theme.palette.primary.main,
    boxShadow: `0 0 10px ${theme.palette.primary.main}`,
  },
}));

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'text' | 'outlined' | 'contained' | 'gradient' | 'glow';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  animate?: 'pulse' | 'shake' | 'bounce';
  tooltip?: string;
  badge?: number | string;
  sx?: any;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
  component?: React.ElementType;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  animate,
  tooltip,
  badge,
  sx,
  type = 'button',
  href,
  target,
  component,
}) => {
  const theme = useTheme();

  const buttonProps = {
    onClick,
    color,
    size,
    startIcon: loading ? <CircularProgress size={16} /> : startIcon,
    endIcon: loading ? null : endIcon,
    disabled: disabled || loading,
    fullWidth,
    sx,
    type,
    href,
    target,
    component,
  };

  const renderButton = () => {
    if (variant === 'gradient') {
      return (
        <GradientButton {...buttonProps}>
          {loading ? 'Carregando...' : children}
        </GradientButton>
      );
    }

    if (variant === 'glow') {
      return (
        <GlowButton {...buttonProps}>
          {loading ? 'Carregando...' : children}
        </GlowButton>
      );
    }

    return (
      <AnimatedButton
        {...buttonProps}
        variant={variant}
        animate={animate}
      >
        {loading ? 'Carregando...' : children}
      </AnimatedButton>
    );
  };

  const button = renderButton();

  // Wrap com badge se necessário
  const buttonWithBadge = badge ? (
    <Badge badgeContent={badge} color="error">
      {button}
    </Badge>
  ) : button;

  // Wrap com tooltip se necessário
  return tooltip ? (
    <Tooltip title={tooltip}>
      {buttonWithBadge}
    </Tooltip>
  ) : buttonWithBadge;
};

// Componente para botão com ícone
interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  tooltip?: string;
  badge?: number | string;
  sx?: any;
  edge?: 'start' | 'end' | false;
}

export const CustomIconButton: React.FC<IconButtonProps> = ({
  children,
  onClick,
  color = 'primary',
  size = 'medium',
  disabled = false,
  tooltip,
  badge,
  sx,
  edge,
}) => {
  const button = (
    <IconButton
      onClick={onClick}
      color={color}
      size={size}
      disabled={disabled}
      sx={sx}
      edge={edge}
    >
      {children}
    </IconButton>
  );

  const buttonWithBadge = badge ? (
    <Badge badgeContent={badge} color="error">
      {button}
    </Badge>
  ) : button;

  return tooltip ? (
    <Tooltip title={tooltip}>
      {buttonWithBadge}
    </Tooltip>
  ) : buttonWithBadge;
};

// Componente para Floating Action Button
interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'extended';
  disabled?: boolean;
  tooltip?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  sx?: any;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  onClick,
  color = 'primary',
  size = 'large',
  variant = 'circular',
  disabled = false,
  tooltip,
  position = 'bottom-right',
  sx,
}) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 16, right: 16 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 16, left: 16 };
      case 'top-right':
        return { ...baseStyles, top: 80, right: 16 };
      case 'top-left':
        return { ...baseStyles, top: 80, left: 16 };
      default:
        return { ...baseStyles, bottom: 16, right: 16 };
    }
  };

  const button = (
    <Fab
      onClick={onClick}
      color={color}
      size={size}
      variant={variant}
      disabled={disabled}
      sx={{
        ...getPositionStyles(),
        ...sx,
      }}
    >
      {children}
    </Fab>
  );

  return tooltip ? (
    <Tooltip title={tooltip}>
      {button}
    </Tooltip>
  ) : button;
};

// Componente para grupo de botões
interface ButtonGroupProps {
  buttons: Array<{
    label: string;
    onClick: () => void;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  }>;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  sx?: any;
}

export const CustomButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  variant = 'outlined',
  size = 'medium',
  orientation = 'horizontal',
  fullWidth = false,
  sx,
}) => {
  return (
    <ButtonGroup
      variant={variant}
      size={size}
      orientation={orientation}
      fullWidth={fullWidth}
      sx={sx}
    >
      {buttons.map((button, index) => (
        <Button
          key={index}
          onClick={button.onClick}
          startIcon={button.loading ? <CircularProgress size={16} /> : button.startIcon}
          endIcon={button.loading ? null : button.endIcon}
          disabled={button.disabled || button.loading}
          color={button.color}
        >
          {button.loading ? 'Carregando...' : button.label}
        </Button>
      ))}
    </ButtonGroup>
  );
};

// Componente para botão de toggle
interface ToggleButtonProps {
  selected: boolean;
  onChange: (selected: boolean) => void;
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  tooltip?: string;
  sx?: any;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  selected,
  onChange,
  children,
  color = 'primary',
  size = 'medium',
  disabled = false,
  tooltip,
  sx,
}) => {
  const theme = useTheme();

  const button = (
    <Button
      onClick={() => onChange(!selected)}
      variant={selected ? 'contained' : 'outlined'}
      color={color}
      size={size}
      disabled={disabled}
      sx={{
        ...sx,
        ...(selected && {
          backgroundColor: alpha(theme.palette[color].main, 0.1),
          borderColor: theme.palette[color].main,
        }),
      }}
    >
      {children}
    </Button>
  );

  return tooltip ? (
    <Tooltip title={tooltip}>
      {button}
    </Tooltip>
  ) : button;
};

export default CustomButton;
