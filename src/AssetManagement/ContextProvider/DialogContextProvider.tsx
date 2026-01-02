import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
} from "react";

import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

export interface DialogContextprops {
  /**Controlled open state */
  open: boolean;
  /**Handle open change event */
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  /**controlled title for dialogue */
  title: ReactNode;
  /**handle title change event */
  onTitleChange: Dispatch<SetStateAction<ReactNode>>;
  /** controlled body */
  body: ReactNode;
  /** controlled body change */
  onBodyChange: Dispatch<SetStateAction<ReactNode>>;
  actions: ReactNode;
  onActionsChange: Dispatch<SetStateAction<ReactNode>>;
}

export const DialogContext = createContext<DialogContextprops | null>(null);

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1),
    // Enhanced shadow for depth
    boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 6px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
    // Subtle inner glow
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 4,
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  },
}));

export const DialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [body, setBody] = useState<ReactNode>(null);
  const [title, setTitle] = useState<ReactNode>(null);
  const [actions, setActions] = useState<ReactNode>(null);

  const handleOpenChange = () => {
    setOpen(false);
  };
  return (
    <DialogContext.Provider
      value={{
        open,
        onOpenChange: setOpen,
        body,
        onBodyChange: setBody,
        title,
        onTitleChange: setTitle,
        actions,
        onActionsChange: setActions,
      }}
    >
      <StyledDialog
        open={open}
        onClose={() => handleOpenChange()}
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{body}</DialogContent>
        <DialogActions>{actions}</DialogActions>
      </StyledDialog>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }
  return context;
};
