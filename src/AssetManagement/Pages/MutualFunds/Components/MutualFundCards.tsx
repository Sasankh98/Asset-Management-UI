import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import {
  TrackChangesIcon,
  CurrencyRupeeIcon,
  ShowChartIcon,
} from "../../../../core/MUI/icons";

interface MutualFundCardProps {
  header: string;
  value: string;
  content: string;
  icon: string;
  isColoured?: boolean;
}
const MutualFundCard = ({
  header,
  value,
  content,
  icon,
  isColoured = false,
}: MutualFundCardProps) => {
  const iconElement = () => {
    switch (icon) {
      case "symbol":
        return <CurrencyRupeeIcon />;
      case "chart":
        return <ShowChartIcon />;
      case "tracking":
        return <TrackChangesIcon />;
      default:
        return null;
    }
  };
  return (
    <Card
      sx={{
        minWidth: 275,
        borderRadius: 3,
        boxShadow: "0.125rem 0.125rem 1.5rem grey",
      }}
    >
      <CardContent
        sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            {header}
          </Typography>
          <Typography>{iconElement()}</Typography>
        </div>
        <div style={{ textAlign: "left" }}>
          {!isColoured ? (
            <Typography>{value}</Typography>
          ) : (
            <Typography
              sx={value.includes("-") ? { color: "red" } : { color: "#22BB33" }}
            >
              {value}
            </Typography>
          )}
          <Typography variant="body2">{content}</Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default MutualFundCard;
