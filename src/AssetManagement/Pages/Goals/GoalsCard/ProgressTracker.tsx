import { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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
    <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1, mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            mb: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 5,
              background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
            },
          }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center" }}
        >{`${progress.toFixed(1)}%`}</Typography>
      </Box>
    </Box>
  );
}
