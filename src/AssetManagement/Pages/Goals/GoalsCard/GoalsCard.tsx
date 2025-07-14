import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import bikeIcon from "../../../../Assets/765RS.jpg";
import LinearWithValueLabel from "./ProgressTracker";
import { Goals } from "../../../../../server/types";
import { formatCurrency } from "../../../../utils/currencyConverter";


export default function GoalsCard({ goal }: { goal: Goals }) {
console.log("Goal Details:", goal);
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title="Triumph Street Triple 765 RS"
        subheader="September 14, 2016"
      />
      <CardMedia
        component="img"
        height="260"
        src={bikeIcon}
        alt="Paella dish"
      />
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          <Typography>Target Amount - {formatCurrency(goal.targetAmount)}</Typography>
          <LinearWithValueLabel currentValue={goal.savedAmount} targetValue={goal.targetAmount} />
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            gap={1}
          >
           {formatCurrency(goal.savedAmount)}
            <Typography sx={{ fontSize: 12 }}>saved so far !!</Typography>
          </Typography>
        </Typography>
      </CardContent>
      <CardContent sx={{ display: "flex", flexDirection: "column" ,marginTop: '-1rem'}}>
        <Typography sx={{ marginBottom: 2 }}>Goal:</Typography>
        <Typography
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}
          >
            <Typography sx={{ marginBottom: 2 }}>Target Date</Typography>
            <Typography sx={{ marginBottom: 2 }}>Value</Typography>
            <Typography>Remaining</Typography>
          </Typography>
          <Typography
            sx={{
              display: "flex",
              flexDirection: "column",
              textAlign: "right",
            }}
          >
            <Typography sx={{ marginBottom: 2 }}>{goal.targetDate}</Typography>
            <Typography sx={{ marginBottom: 2 }}>{formatCurrency(goal.targetAmount)}</Typography>
            <Typography>{formatCurrency(goal.targetAmount-goal.savedAmount)}</Typography>
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
