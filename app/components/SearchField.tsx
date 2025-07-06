// Componente SearchField reutilizável

import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Autocomplete,
  Paper,
  Typography,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  TuneOutlined as TuneIcon,
} from '@mui/icons-material';
import { utils } from '../utils/formatters';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  disabled?: boolean;
  debounceMs?: number;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  autoFocus?: boolean;
  suggestions?: string[];
  filters?: Array<{
    label: string;
    value: string;
    active: boolean;
    onToggle: () => void;
  }>;
  onFilterToggle?: () => void;
  loading?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  onClear,
  onSearch,
  placeholder = 'Buscar...',
  label,
  fullWidth = true,
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  debounceMs = 300,
  showClearButton = true,
  showSearchButton = false,
  autoFocus = false,
  suggestions = [],
  filters = [],
  onFilterToggle,
  loading = false,
}) => {
  const theme = useTheme();
  const [internalValue, setInternalValue] = React.useState(value);

  // Debounce para otimizar as chamadas de busca
  const debouncedSearch = React.useMemo(
    () => utils.debounce((searchValue: string) => {
      onChange(searchValue);
      onSearch?.(searchValue);
    }, debounceMs),
    [onChange, onSearch, debounceMs]
  );

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    debouncedSearch(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch?.(internalValue);
    }
  };

  const handleSearchClick = () => {
    onSearch?.(internalValue);
  };

  // Renderização com sugestões (Autocomplete)
  if (suggestions.length > 0) {
    return (
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <Autocomplete
          freeSolo
          options={suggestions}
          value={internalValue}
          onChange={(_, newValue) => {
            const searchValue = newValue || '';
            setInternalValue(searchValue);
            onChange(searchValue);
            onSearch?.(searchValue);
          }}
          onInputChange={(_, newValue) => {
            setInternalValue(newValue);
            debouncedSearch(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              variant={variant}
              size={size}
              disabled={disabled}
              autoFocus={autoFocus}
              onKeyPress={handleKeyPress}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color={loading ? 'disabled' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {internalValue && showClearButton && (
                      <Tooltip title="Limpar busca">
                        <IconButton
                          size="small"
                          onClick={handleClear}
                          disabled={disabled}
                        >
                          <ClearIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {showSearchButton && (
                      <Tooltip title="Buscar">
                        <IconButton
                          size="small"
                          onClick={handleSearchClick}
                          disabled={disabled}
                        >
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onFilterToggle && (
                      <Tooltip title="Filtros">
                        <IconButton
                          size="small"
                          onClick={onFilterToggle}
                          disabled={disabled}
                        >
                          <TuneIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          )}
          PaperComponent={({ children }) => (
            <Paper elevation={8} sx={{ mt: 1 }}>
              {children}
            </Paper>
          )}
        />
        
        {/* Filtros ativos */}
        {filters.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {filters.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                size="small"
                color={filter.active ? 'primary' : 'default'}
                onClick={filter.onToggle}
                onDelete={filter.active ? filter.onToggle : undefined}
                deleteIcon={<ClearIcon />}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  }

  // Renderização padrão
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        label={label}
        placeholder={placeholder}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        autoFocus={autoFocus}
        value={internalValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color={loading ? 'disabled' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {internalValue && showClearButton && (
                <Tooltip title="Limpar busca">
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    disabled={disabled}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
              {showSearchButton && (
                <Tooltip title="Buscar">
                  <IconButton
                    size="small"
                    onClick={handleSearchClick}
                    disabled={disabled}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onFilterToggle && (
                <Tooltip title="Filtros">
                  <IconButton
                    size="small"
                    onClick={onFilterToggle}
                    disabled={disabled}
                  >
                    <TuneIcon />
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
      />
      
      {/* Filtros ativos */}
      {filters.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {filters.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              size="small"
              color={filter.active ? 'primary' : 'default'}
              onClick={filter.onToggle}
              onDelete={filter.active ? filter.onToggle : undefined}
              deleteIcon={<ClearIcon />}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Componente para busca avançada
interface AdvancedSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  filters?: Array<{
    label: string;
    value: string;
    active: boolean;
    onToggle: () => void;
  }>;
  categories?: Array<{
    label: string;
    value: string;
    selected: boolean;
    onSelect: () => void;
  }>;
  showResults?: boolean;
  resultsCount?: number;
  loading?: boolean;
}

export const AdvancedSearchField: React.FC<AdvancedSearchFieldProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  suggestions = [],
  filters = [],
  categories = [],
  showResults = false,
  resultsCount = 0,
  loading = false,
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      <SearchField
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeholder}
        suggestions={suggestions}
        filters={filters}
        onFilterToggle={() => setShowFilters(!showFilters)}
        loading={loading}
        showSearchButton
      />
      
      {/* Painel de filtros */}
      {showFilters && (
        <Paper 
          elevation={2} 
          sx={{ 
            mt: 1, 
            p: 2,
            borderRadius: 2,
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Filtros Avançados
          </Typography>
          
          {/* Categorias */}
          {categories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Categorias:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {categories.map((category) => (
                  <Chip
                    key={category.value}
                    label={category.label}
                    size="small"
                    color={category.selected ? 'primary' : 'default'}
                    onClick={category.onSelect}
                    variant={category.selected ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Filtros personalizados */}
          {filters.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Filtros:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {filters.map((filter) => (
                  <Chip
                    key={filter.value}
                    label={filter.label}
                    size="small"
                    color={filter.active ? 'secondary' : 'default'}
                    onClick={filter.onToggle}
                    icon={filter.active ? <FilterIcon /> : undefined}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Resultados */}
      {showResults && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Buscando...' : `${resultsCount} resultado(s) encontrado(s)`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Hook para gerenciar estado de busca
export const useSearch = (initialValue: string = '') => {
  const [searchValue, setSearchValue] = React.useState(initialValue);
  const [filters, setFilters] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);

  const updateFilter = (key: string, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const clearSearch = () => {
    setSearchValue('');
    setFilters({});
  };

  const getActiveFilters = () => {
    return Object.entries(filters)
      .filter(([_, active]) => active)
      .map(([key, _]) => key);
  };

  return {
    searchValue,
    setSearchValue,
    filters,
    setFilters,
    updateFilter,
    toggleFilter,
    clearFilters,
    clearSearch,
    getActiveFilters,
    loading,
    setLoading,
  };
};

export default SearchField;
