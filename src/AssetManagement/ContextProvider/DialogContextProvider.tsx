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
  actions?: ReactNode;
  onActionsChange?: Dispatch<SetStateAction<ReactNode>>;
}

export const DialogContext = createContext<DialogContextprops | null>(null);

const StyledDialog = styled(Dialog)({
  backdropFilter: "blur(8px)",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
});

export const DialogProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [body, setBody] = useState<ReactNode>(null);
  const [title, setTitle] = useState<ReactNode>(null);
  const [actions, setActions] = useState<ReactNode>(null);

  const handleOpenChange = (_, data) => {
    setOpen(data.open);
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
      <StyledDialog open={open} onClose={handleOpenChange} fullWidth>
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
  if(!context){
    throw new Error('useDialog must be used within DialogProvider')
  }
  return context;
}