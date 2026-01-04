// src/shared/components/ErrorBoundary/FeatureErrorFallback.tsx

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface FeatureErrorFallbackProps {
  featureName: string;
  error: Error | null;
  onReset: () => void;
}

export function FeatureErrorFallback({
  featureName,
  error,
  onReset,
}: FeatureErrorFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255, 0, 0, 0.2)',
        minHeight: '300px',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Alert severity="error">
        <Typography variant="h6" component="div">
          {featureName} Failed to Load
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error?.message || 'An unexpected error occurred'}
        </Typography>
      </Alert>

      <Button
        variant="contained"
        onClick={onReset}
        sx={{
          mt: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        Retry
      </Button>
    </Box>
  );
}