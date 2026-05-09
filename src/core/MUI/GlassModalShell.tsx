import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
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
}: GlassModalShellProps) {
  return (
    <ThemeProvider theme={Theme}>
      <StyledModal open={open} onClose={onClose}>
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: 4,
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 6px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            width: { xs: "90%", sm: 600, md: 700 },
            maxHeight: "90vh",
            overflowY: "auto",
            p: { xs: 2, sm: 3, md: 4 },
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 4,
              padding: "1px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              pointerEvents: "none",
            },
          }}
        >
          <Box
            sx={{
              mb: 3,
              pb: 2,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(255, 255, 255, 0.05)",
              mx: -2,
              px: 2,
              pt: 1,
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              fontWeight="600"
              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "rgba(255, 255, 255, 0.7)" }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {children}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.9)",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                },
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
                borderRadius: 3,
                textTransform: "none",
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
                },
                "&:disabled": { opacity: 0.7 },
              }}
            >
              {isLoading ? "Processing..." : confirmLabel}
            </Button>
          </Box>
        </Box>
      </StyledModal>
    </ThemeProvider>
  );
}
