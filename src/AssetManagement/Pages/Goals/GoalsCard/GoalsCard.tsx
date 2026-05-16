import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { Dispatch, SetStateAction, memo } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { GoalsDTO } from "../../../../../server/types";
import { fmtInr } from "../../../../utils/formatCurrency";
import { ImageIcons, ModalTypes } from "../../../../shared/Constants";
import { gr, bikeIcon, tattoo, marriage } from "../../../../Assets";
import { deepEqual } from "../../../../utils/DeepCompare";

interface GoalsCardProps {
  goal: GoalsDTO;
  setGoalsOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedGoal: (goal: GoalsDTO) => void;
  loading?: boolean;
  handleOpenDialogue: (modalType: ModalTypes, selectedGoal?: GoalsDTO) => void;
  handleDeleteGoal: (id: number) => Promise<void>;
}

function emojiForGoal(goal: string): string {
  switch (goal) {
    case ImageIcons.goldenRetriever: return "🐕";
    case ImageIcons.bike:            return "🏍️";
    case ImageIcons.tattoo:          return "🎨";
    case ImageIcons.marriage:        return "💍";
    default:                         return "🎯";
  }
}

function imgForGoal(goal: string): string {
  switch (goal) {
    case ImageIcons.goldenRetriever: return gr;
    case ImageIcons.bike:            return bikeIcon;
    case ImageIcons.tattoo:          return tattoo;
    case ImageIcons.marriage:        return marriage;
    default:                         return bikeIcon;
  }
}

function monthsUntil(dateStr: string): { label: string; months: number } {
  const target = new Date(dateStr);
  const now = new Date();
  const months = Math.max(
    0,
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
  );
  const years = Math.floor(months / 12);
  const rem   = months % 12;
  const label = years > 0 ? `${years}y ${rem}m` : `${rem}m`;
  return { label, months };
}

function GoalsCard({
  goal,
  setGoalsOpen,
  setSelectedGoal,
  loading = false,
  handleOpenDialogue,
  handleDeleteGoal,
}: GoalsCardProps) {
  if (loading) {
    return (
      <Card data-testid="loading-true" sx={{ maxWidth: 320, borderRadius: 2, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="70%" />
          </Box>
        </Box>
      </Card>
    );
  }

  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
    : 0;

  const RADIUS = 34;
  const CIRC = 2 * Math.PI * RADIUS;
  const strokeDash = `${(pct / 100) * CIRC} ${CIRC}`;

  const { label: timeLabel, months } = monthsUntil(goal.targetDate);
  const monthly = months > 0
    ? Math.ceil((goal.targetAmount - goal.savedAmount) / months)
    : null;

  const targetDateDisplay = new Date(goal.targetDate).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const onTrack = monthly !== null && goal.savedAmount > 0;

  const handleOpenGoalsEdit = () => {
    setGoalsOpen(true);
    setSelectedGoal(goal);
    handleOpenDialogue(ModalTypes.edit, goal);
  };

  return (
    <Card sx={{ maxWidth: 320, borderRadius: 2 }}>
      <CardContent>
        {/* Header — thumbnail + title + actions */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={imgForGoal(goal.goal)}
              sx={{ width: 40, height: 40, fontSize: 18 }}
            >
              {emojiForGoal(goal.goal)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 160 }}>
                {goal.goal}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Target {targetDateDisplay} · {timeLabel}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit" arrow slots={{ transition: Fade }} slotProps={{ transition: { timeout: 400 } }}>
              <IconButton size="small" onClick={handleOpenGoalsEdit} data-testid="edit-button">
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete" arrow slots={{ transition: Fade }} slotProps={{ transition: { timeout: 400 } }}>
              <IconButton size="small" color="error" onClick={() => handleDeleteGoal(goal.id)} data-testid="delete-button">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Progress ring (hero) + stats */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {/* Donut ring */}
          <Box sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r={RADIUS}
                fill="none"
                stroke="#4FC3F7"
                strokeWidth="6"
                strokeDasharray={strokeDash}
                strokeLinecap="round"
              />
            </svg>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1 }}>
                {pct}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
                {fmtInr(goal.savedAmount)} of {fmtInr(goal.targetAmount)}
              </Typography>
            </Box>
          </Box>

          {/* Quick stats */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {monthly !== null && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Need monthly</Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main" fontFamily="monospace">
                  {fmtInr(monthly)}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Time left</Typography>
              <Typography variant="caption" fontWeight={600} fontFamily="monospace">{timeLabel}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">On track?</Typography>
              {onTrack ? (
                <Chip label="On track" size="small" color="success" sx={{ height: 18, fontSize: 9 }} />
              ) : (
                <Chip label="Set up SIP" size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* CTAs */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" startIcon={<AddIcon />} fullWidth sx={{ textTransform: "none", fontSize: 11 }}>
            Add Money
          </Button>
          <Button size="small" variant="outlined" fullWidth sx={{ textTransform: "none", fontSize: 11 }}>
            Auto-SIP
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(GoalsCard, (prevProps, nextProps) => {
  return (
    deepEqual<GoalsDTO>(prevProps.goal, nextProps.goal) &&
    prevProps.loading === nextProps.loading
  );
});
