import { FC, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import InfoIcon from "@mui/icons-material/Info";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import { httpService, baseURL } from "../../../services/axiosConnection";

interface UserProfile {
  email: string;
  id?: number;
  createdAt?: string;
}

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

const Settings: FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password form
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [pwSaving, setPwSaving]     = useState(false);
  const [pwMsg, setPwMsg]           = useState<{ text: string; sev: "success" | "error" } | null>(null);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    httpService
      .get<{ status: string; data: { user: UserProfile } }>(`${baseURL}/users/me`)
      .then((res) => setProfile(res?.data?.user ?? null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleChangePassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      setPwMsg({ text: "New passwords do not match.", sev: "error" });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters.", sev: "error" });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await httpService.post(`${baseURL}/users/changePassword`, {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwMsg({ text: "Password changed successfully.", sev: "success" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      setPwMsg({ text: "Failed to change password. Check your current password.", sev: "error" });
    } finally {
      setPwSaving(false);
    }
  };

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
    : null;

  return (
    <Box sx={{ p: 2, maxWidth: 680, mx: "auto" }} data-testid="settings-container">

      {/* Profile card */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AccountCircleIcon sx={{ color: "primary.main" }} />
          <Typography variant="subtitle1" fontWeight={600}>Profile</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="35%" height={20} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 22, fontWeight: 700 }}>
              {profile ? initials(profile.email) : "?"}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {profile?.email ?? "Unknown"}
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy email"}>
                  <IconButton size="small" onClick={handleCopyEmail}>
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              {memberSince && (
                <Typography variant="caption" color="text.secondary">
                  Member since {memberSince}
                </Typography>
              )}
              {profile?.id && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={`ID: ${profile.id}`} size="small" variant="outlined" />
                </Box>
              )}
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Box>
        )}
      </Paper>

      {/* Change password */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LockIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>Change Password</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            size="small"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            autoComplete="current-password"
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              label="New Password"
              type="password"
              size="small"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              size="small"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              error={!!confirmPw && newPw !== confirmPw}
              helperText={!!confirmPw && newPw !== confirmPw ? "Passwords don't match" : undefined}
            />
          </Box>

          {pwMsg && (
            <Alert severity={pwMsg.sev} sx={{ py: 0 }}>{pwMsg.text}</Alert>
          )}

          <Box>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            >
              {pwSaving ? "Saving…" : "Update Password"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* About */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <InfoIcon sx={{ color: "text.secondary", fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={600}>About</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { label: "App", value: "Asset Management" },
            { label: "Version", value: "1.0.0" },
            { label: "Data", value: "Stored securely on Render (PostgreSQL)" },
            { label: "NAV Source", value: "MFAPI.in (Indian Mutual Funds)" },
            { label: "Stock Search", value: "Alpha Vantage API" },
          ].map((r) => (
            <Box key={r.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{r.label}</Typography>
              <Typography variant="body2" fontWeight={500}>{r.value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
