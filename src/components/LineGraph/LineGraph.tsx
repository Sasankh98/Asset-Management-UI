import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface DataPoint {
  date: string;
  expenses: number | null;
  cumulativeExpenses: number | null;
  income: number | null;
  balance: number | null;
}

interface LineGraphProps {
  monthlyData: {
    date: string;
    amount: number;
    type: string;
  }[];
}

export default function LineGraph({ monthlyData }: LineGraphProps) {

      const theme = useTheme();
  const [processedData, setProcessedData] = useState<DataPoint[]>([]);

useEffect(() => {
    const processData = () => {
      // Sort data by date
      const sortedData = [...monthlyData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let totalIncome = 0;
      let cumulativeExpenses = 0;
      const dailyData = new Map<string, DataPoint>();

      // Initialize with zero values for each day of the month
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      ).getDate();
      const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ).toISOString().split('T')[0];

      // Initialize all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth(),
          day
        ).toISOString().split('T')[0];
        
        // For dates after today, set null values to break the line
        if (date > today) {
          dailyData.set(date, {
            date,
            expenses: null,
            cumulativeExpenses: null,
            income: null,
            balance: null
          });
        } else {
          dailyData.set(date, {
            date,
            expenses: 0,
            cumulativeExpenses: 0,
            income: 0,
            balance: 0
          });
        }
      }

      // First pass: Calculate total income for days up to today
         sortedData.forEach(transaction => {
        if (transaction.date <= today && transaction.type === 'income') {
          totalIncome += Number(Number(transaction.amount).toFixed(2));
        }
      });

      // Second pass: Process all transactions up to today
      sortedData.forEach(transaction => {
        if (transaction.date <= today) {
          const existingData = dailyData.get(transaction.date) || {
            date: transaction.date,
            expenses: 0,
            cumulativeExpenses: 0,
            income: totalIncome,
            balance: totalIncome
          };

          if (transaction.type === 'expense') {
            const expenseAmount = Number(Number(transaction.amount).toFixed(2));
            existingData.expenses = expenseAmount;
            cumulativeExpenses += expenseAmount;
            existingData.cumulativeExpenses = Number(cumulativeExpenses.toFixed(2));
            existingData.balance = Number((totalIncome - cumulativeExpenses).toFixed(2));
          } else {
            existingData.income = totalIncome;
          }

          dailyData.set(transaction.date, existingData);
        }
      });

      // Convert Map to array and sort by date
      const processedData = Array.from(dailyData.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Update running values for days without transactions (only up to today)
      let lastCumulativeExpenses = 0;
      let lastBalance = totalIncome;

      processedData.forEach(data => {
        if (data.date <= today) {
          // Set income for all days up to today
          data.income = totalIncome;

          // If no transaction on this day, use previous cumulative values
          if (data.expenses === 0 || data.expenses === null) {
            data.cumulativeExpenses = lastCumulativeExpenses;
            data.balance = lastBalance;
          } else {
            lastCumulativeExpenses = data.cumulativeExpenses ?? lastCumulativeExpenses;
            lastBalance = data.balance ?? lastBalance;
          }
        }
      });

      return processedData;
    };

    setProcessedData(processData());
  }, [monthlyData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={3}
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {new Date(label).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short'
            })}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: entry.color
                }}
              />
              <Typography variant="body2">
                {entry.name}: {formatCurrency(Number(parseFloat(entry.value).toFixed(2)))}
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };
return (
 <Paper
    elevation={4}
    sx={{
      p: 3,
      borderRadius: 2,
      width: '96%',
      margin: '0 2%',
      height: 500,
      background: 'linear-gradient(110deg, rgb(26, 32, 53) 0%, rgb(22, 28, 47) 100%)',
      boxShadow: `
        0 16px 24px -8px rgba(0, 0, 0, 0.25),
        0 8px 16px -6px rgba(0, 0, 0, 0.3)
      `,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 2,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none'
      }
    }}
  >
    <Typography 
      variant="h6" 
      gutterBottom
      sx={{
        color: 'white',
        fontWeight: 'medium',
        mb: 3,
        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      Monthly Income & Expenses Tracker
    </Typography>
    <Box sx={{ flex: 1, width: '100%', position: 'relative' }}>
      <ResponsiveContainer>
        <LineChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 40, // Increased bottom margin for legend
          }}
        >
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.error.main} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={theme.palette.error.main} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke={theme.palette.divider}
          opacity={0.3}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => new Date(date).getDate().toString()}
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme.palette.divider }}
          axisLine={{ stroke: theme.palette.divider }}
        />
            <YAxis
          tickFormatter={(value) => formatCurrency(value)}
          stroke={theme.palette.text.secondary}
          tick={{ fontSize: 12 }}
          tickLine={{ stroke: theme.palette.divider }}
          axisLine={{ stroke: theme.palette.divider }}
          allowDecimals={true}
          scale="linear"
        />
        <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <Typography
                variant="body2"
                sx={{ 
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {value}
              </Typography>
            )}
          />
     <Line
  type="stepAfter"
  dataKey="income"
  stroke={theme.palette.success.main}
  strokeWidth={3}
  dot={false}
  name="Total Income"
  activeDot={{ 
    r: 8, 
    strokeWidth: 2,
    stroke: theme.palette.success.light,
    fill: theme.palette.success.main
  }}
  fill="url(#incomeGradient)"
  connectNulls={false}
/>
<Line
  type="monotone"
  dataKey="cumulativeExpenses"
  stroke={theme.palette.error.main}
  strokeWidth={3}
  dot={false}
  name="Total Expenses"
  activeDot={{ 
    r: 8, 
    strokeWidth: 2,
    stroke: theme.palette.error.light,
    fill: theme.palette.error.main
  }}
  fill="url(#expenseGradient)"
  connectNulls={false}
/>
<Line
  type="monotone"
  dataKey="balance"
  stroke={theme.palette.primary.main}
  strokeWidth={3}
  dot={false}
  name="Remaining Balance"
  activeDot={{ 
    r: 8, 
    strokeWidth: 2,
    stroke: theme.palette.primary.light,
    fill: theme.palette.primary.main
  }}
  fill="url(#balanceGradient)"
  connectNulls={false}
/>
      </LineChart>
    </ResponsiveContainer>
     </Box>
  </Paper>
);
}