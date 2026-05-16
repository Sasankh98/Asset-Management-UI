import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { ThemeProvider } from "@mui/material/styles";
import { StyledModal } from "./styles";
import { Theme } from "./Theme";

interface GlassModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  confirmLabel: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmTestId?: string;
  children: ReactNode;
  recurring?: boolean;
  onRecurringChange?: (v: boolean) => void;
}

export default function GlassModalShell({
  open,
  onClose,
  title,
  subtitle,
  confirmLabel,
  onConfirm,
  isLoading = false,
  confirmTestId,
  children,
  recurring,
  onRecurringChange,
}: GlassModalShellProps) {
  return (
    <ThemeProvider theme={Theme}>
      <StyledModal open={open} onClose={onClose}>
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            width: { xs: "92%", sm: "85%", md: 700 },
            maxWidth: 700,
            maxHeight: "90vh",
            overflowY: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Flat header — no nested pill */}
          <Box sx={{ pb: 2, mb: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Typography variant="h6" component="h2" fontWeight={600} sx={{ color: "rgba(255,255,255,0.9)" }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.6)" }}>
              {subtitle}
            </Typography>
          </Box>

          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {children}
          </Box>

          {/* Action bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 3,
              pt: 2.5,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {onRecurringChange != null ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={recurring ?? false}
                    onChange={(e) => onRecurringChange(e.target.checked)}
                    size="small"
                    sx={{ color: "rgba(255,255,255,0.4)", "&.Mui-checked": { color: "#4FC3F7" } }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                    Recurring · monthly
                  </Typography>
                }
              />
            ) : (
              <Box />
            )}
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": { border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                data-testid={confirmTestId}
                onClick={onConfirm}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  px: 2.5,
                  py: 1,
                  background: "#4FC3F7",
                  color: "#000",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": { background: "#81d4fa", boxShadow: "none" },
                  "&:disabled": { opacity: 0.7 },
                }}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </Button>
            </Box>
          </Box>
        </Box>
      </StyledModal>
    </ThemeProvider>
  );
}
