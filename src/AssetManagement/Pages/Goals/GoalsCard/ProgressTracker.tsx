import { useEffect, useState } from "react";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

interface LinearWithValueLabelProps {
  currentValue: number;
  targetValue: number;
}

export default function LinearWithValueLabel({
  currentValue,
  targetValue,
}: LinearWithValueLabelProps) {

  const [progress, setProgress] = useState(23);

  useEffect(() => {
    const value = (currentValue / targetValue) * 100;
    setProgress(value);
  }, [currentValue, targetValue]);
  
  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
