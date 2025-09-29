import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import { gr, bikeIcon, tattoo, marriage } from "../../../../Assets";
import LinearWithValueLabel from "./ProgressTracker";
import { Goals } from "../../../../../server/types";
import { formatCurrency } from "../../../../utils/currencyConverter";
import { ImageIcons } from "../../../../shared/Constants";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import Skeleton from "@mui/material/Skeleton";
import { Dispatch, SetStateAction } from "react";
import { getTimeAgo } from "../../../../utils/dateTime";
import  Box  from "@mui/material/Box";

interface GoalsCardProps {
  goal: Goals;
  setGoalsOpen: Dispatch<SetStateAction<boolean>>;
  setType: Dispatch<SetStateAction<"create" | "edit" | "">>;
  setSelectedGoal: (goal: Goals | undefined) => void;
  loading: boolean;
}

export default function GoalsCard({
  goal,
  setGoalsOpen,
  setType,
  setSelectedGoal,
  loading,
}: GoalsCardProps) {
  const imageIcon = (() => {
    switch (goal.goal) {
      case ImageIcons.goldenRetriever:
        return gr;
      case ImageIcons.bike:
        return bikeIcon;
      case ImageIcons.tattoo:
        return tattoo;
      case ImageIcons.marriage:
        return marriage;
      default:
        return bikeIcon;
    }
  })();

  const handleOpenGoalsEdit = () => {
    setType("edit");
    setGoalsOpen(true);
    setSelectedGoal(goal);
  };
  return (
    <Card sx={{ maxWidth: 345, borderRadius: 2 }}>
      <CardHeader
        avatar={
          loading ? (
            <Skeleton
              animation="wave"
              variant="circular"
              width={40}
              height={40}
            />
          ) : (
            <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
              {goal.goal.slice(0, 1).toUpperCase()}
            </Avatar>
          )
        }
        action={
          loading ? null : (
            <IconButton
              aria-label="settings"
              data-testid="edit-button"
              onClick={() => handleOpenGoalsEdit()}
            >
              <Tooltip
                title="Edit Goals"
                arrow
                slots={{
                  transition: Fade,
                }}
                slotProps={{
                  transition: { timeout: 600 },
                }}
              >
                <EditIcon />
              </Tooltip>
            </IconButton>
          )
        }
        title={
          loading ? (
            <Skeleton
              animation="wave"
              height={10}
              width="80%"
              style={{ marginBottom: 6 }}
            />
          ) : (
            goal.goal
          )
        }
        subheader={
          loading ? (
            <Skeleton animation="wave" height={10} width="40%" />
          ) : (
            `Updated ${getTimeAgo(goal.updatedAt)}`
          )
        }
      />
      {loading ? (
        <Skeleton sx={{ height: 190 }} animation="wave" variant="rectangular" />
      ) : (
        <CardMedia
          component="img"
          height="260"
          src={imageIcon}
          alt={goal.goal}
        />
      )}
      <CardContent>
        {loading ? (
          <>
            <Skeleton
              animation="wave"
              height={10}
              style={{ marginBottom: 6 }}
            />
            <Skeleton animation="wave" height={10} width="80%" />
          </>
        ) : (
          <Box sx={{ color: "text.secondary" }}>
            <Typography>
              Target Amount - {formatCurrency(goal.targetAmount)}
            </Typography>
            <LinearWithValueLabel
              currentValue={goal.savedAmount}
              targetValue={goal.targetAmount}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {formatCurrency(goal.savedAmount)}
              <Typography sx={{ fontSize: 12 }}>saved so far !!</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
      <CardContent
        sx={{ display: "flex", flexDirection: "column", marginTop: "-1rem" }}
      >
        {loading ? (
          <div
            style={{ display: "flex", justifyContent: "space-between" }}
            data-testid="loading-true"
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Skeleton
                animation="wave"
                height={10}
                width="5rem"
                style={{ marginBottom: 6 }}
              />
              <Skeleton animation="wave" height={10} width="80%" />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Skeleton
                animation="wave"
                height={10}
                width="5rem"
                style={{ marginBottom: 6 }}
              />
              <Skeleton animation="wave" height={10} width="80%" />
            </div>
          </div>
        ) : (
          <>
            <Typography sx={{ marginBottom: 2 }}>Goal:</Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
               <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                <Typography sx={{ marginBottom: 2 }}>Target Date</Typography>
                <Typography sx={{ marginBottom: 2 }}>Value</Typography>
                <Typography>Remaining</Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                <Typography sx={{ marginBottom: 2 }}>
                  {goal.targetDate}
                </Typography>
                <Typography sx={{ marginBottom: 2 }}>
                  {formatCurrency(goal.targetAmount)}
                </Typography>
                <Typography>
                  {formatCurrency(goal.targetAmount - goal.savedAmount)}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
