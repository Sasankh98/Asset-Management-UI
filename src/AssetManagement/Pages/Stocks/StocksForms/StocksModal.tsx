// import { SelectChangeEvent } from "@mui/material/Select";
// import Box from "@mui/material/Box";
// import Grid from "@mui/material/Grid";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import InputAdornment from "@mui/material/InputAdornment";
// import FormControl from "@mui/material/FormControl";
// import { ThemeProvider } from "@mui/material/styles";
// import { Dispatch, SetStateAction, useEffect, useState } from "react";
// import { Theme } from "../../../../core/MUI/Theme";
// import { CreateStocksDTO, Stock } from "../../../../../server/types";
// import {
//   RefreshDataProps,
//   useAssetManagementContext,
// } from "../../../ContextProvider/ContextProvider";
// import StocksService from "../../../../services/StocksService/StocksService";
// import { TransactionTypesEnum, TypeEnum } from "../../../../shared/Constants";
// import {
//   GlassInputLabel,
//   GlassMenuItem,
//   StyledModal,
//   GlassTextField,
//   GlassSelect,
//   MenuProps,
// } from "../../../../core/MUI/styles";

// interface StocksFormProps {
//   open: boolean;
//   type: "create" | "edit" | "info" | "";
//   handleClose: () => void;
//   setRefreshData: Dispatch<SetStateAction<RefreshDataProps>>;
//   selectedStock?: Stock;
// }

// const StocksModal = ({
//   open,
//   type,
//   handleClose,
//   selectedStock,
//   setRefreshData,
// }: StocksFormProps) => {
//   const [stocksData, setStocksData] = useState<CreateStocksDTO>({
//     stockName: "",
//     avg: 0,
//     quantity: 0,
//     // SellPrice: "",
//     // Dividends: "",
//     buyTax: 0,
//     // SellingTax: "",
//     buyDate: "",
//     // SellDate: "",
//     status: "",
//     user: "Sasankh",
//   });

//   const { setSnackBarOptions } = useAssetManagementContext();

//   const handleTransactionData = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setStocksData({ ...stocksData, [name]: value });
//   };

//   const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
//     const { name, value } = event.target;
//     if (name) {
//       setStocksData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleStock = async () => {
//     if (type === "create") {
//       if (
//         !stocksData.stockName ||
//         !stocksData.avg ||
//         !stocksData.quantity ||
//         !stocksData.buyDate ||
//         !stocksData.status ||
//         !stocksData.buyTax
//       ) {
//         alert("Please fill all fields");
//         return;
//       }
//       const response = await StocksService().postStockDetails(stocksData);
//       if (response) {
//         handleClose();
//         setSnackBarOptions({
//           open: true,
//           message: "Created Transaction details Successfully",
//           severity: "success",
//         });
//         setRefreshData((prev) => ({
//           ...prev,
//           refreshSalary: true,
//         }));
//       }
//     } else if (type === "edit" && stocksData) {
//       const response = await StocksService().updateStockDetails(
//         selectedStock?.id,
//         stocksData
//       );
//       if (response) {
//         handleClose();
//         setRefreshData((prev) => ({
//           ...prev,
//           refreshSalary: true,
//         }));
//       }
//     }
//   };

//   useEffect(() => {
//     if ((type === "edit" || type === "info") && selectedStock) {
//       setStocksData({
//         stockName: selectedStock?.stockName || "",
//         avg: selectedStock?.avg || 0,
//         quantity: selectedStock?.quantity || 0,
//         buyTax: selectedStock?.buyTax || 0,
//         buyDate: selectedStock?.buyDate || "",
//         status: selectedStock?.status || "",
//         user: selectedStock?.user || "Sasankh",
//       });
//     } else if (type === "create") {
//       setStocksData({
//         stockName: "",
//         avg: 0,
//         quantity: 0,
//         buyTax: 0,
//         buyDate: "",
//         status: "",
//         user: "Sasankh",
//       });
//     }
//   }, [type, selectedStock]);
//   return (
//     <ThemeProvider theme={Theme}>
//       <StyledModal open={open} onClose={handleClose}>
//         <Box
//           sx={{
//             // Glassmorphism effect
//             background: "rgba(255, 255, 255, 0.1)",
//             backdropFilter: "blur(20px)",
//             WebkitBackdropFilter: "blur(20px)", // Safari support
//             border: "1px solid rgba(255, 255, 255, 0.2)",
//             borderRadius: 4,

//             // Enhanced shadow for depth
//             boxShadow: `
//               0 8px 32px rgba(0, 0, 0, 0.12),
//               0 2px 6px rgba(0, 0, 0, 0.08),
//               inset 0 1px 0 rgba(255, 255, 255, 0.1)
//             `,

//             // Position and size
//             width: { xs: "90%", sm: 600, md: 700 },
//             maxHeight: "90vh",
//             overflowY: "auto",
//             p: { xs: 2, sm: 3, md: 4 },
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",

//             // Subtle inner glow
//             "&::before": {
//               content: '""',
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               borderRadius: 4,
//               padding: "1px",
//               background:
//                 "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
//               mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
//               maskComposite: "exclude",
//               pointerEvents: "none",
//             },
//           }}
//         >
//           {/* Header */}
//           <Box
//             sx={{
//               mb: 3,
//               pb: 2,
//               borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
//               background: "rgba(255, 255, 255, 0.05)",
//               mx: -2,
//               px: 2,
//               pt: 1,
//               borderRadius: 4,
//             }}
//           >
//             <Typography
//               variant="h5"
//               component="h2"
//               fontWeight="600"
//               sx={{ color: "rgba(255, 255, 255, 0.9)" }}
//             >
//               {type === "edit"
//                 ? "Edit Transaction Details"
//                 : "Create New Transaction Details"}
//             </Typography>
//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{
//                 mt: 0.5,
//                 color: "rgba(255, 255, 255, 0.7)",
//               }}
//             >
//               {type === "edit"
//                 ? "Update your Transaction details"
//                 : "Set up a new Transaction source"}
//             </Typography>
//           </Box>

//           {/* Form */}
//           <Box
//             component="form"
//             sx={{ display: "flex", flexDirection: "column", gap: 3 }}
//           >
//             <FormControl fullWidth sx={{ mb: 2 }}>
//               <GlassInputLabel id="customer-id-label">
//                 Select Salary Type
//               </GlassInputLabel>

//               <GlassSelect
//                 labelId="demo-simple-select-standard-label"
//                 id="demo-simple-select-standard"
//                 value={""}
//                 onChange={handleSelectChange}
//                 label="Type"
//                 name="type"
//                 MenuProps={MenuProps}
//               >
//                 {TypeEnum.map((enumTypes) => (
//                   <GlassMenuItem value={enumTypes.value} key={enumTypes.value}>
//                     {enumTypes.name}
//                   </GlassMenuItem>
//                 ))}
//               </GlassSelect>
//             </FormControl>

//             <Grid container spacing={2}>
//               <Grid size={6}>
//                 <GlassTextField
//                   fullWidth
//                   label="Amount"
//                   placeholder="0"
//                   value={""}
//                   onChange={handleTransactionData}
//                   name="amount"
//                   type="number"
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">₹</InputAdornment>
//                     ),
//                   }}
//                 />
//               </Grid>
//               <Grid size={6}>
//                 <GlassTextField
//                   fullWidth
//                   label="Credited Date"
//                   value={""}
//                   onChange={handleTransactionData}
//                   name="date"
//                   type="date"
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Grid>
//             </Grid>
//             <FormControl fullWidth sx={{ mb: 2 }}>
//               <GlassInputLabel id="customer-id-label">
//                 Select Transaction Type
//               </GlassInputLabel>

//               <GlassSelect
//                 labelId="demo-simple-select-standard-label"
//                 id="demo-simple-select-standard"
//                 value={""}
//                 onChange={handleSelectChange}
//                 label="Select Transaction Type"
//                 name="transactionType"
//                 MenuProps={MenuProps}
//               >
//                 {TransactionTypesEnum.map((enumTypes) => (
//                   <GlassMenuItem value={enumTypes.name} key={enumTypes.name}>
//                     {enumTypes.name}
//                   </GlassMenuItem>
//                 ))}
//               </GlassSelect>
//             </FormControl>
//           </Box>

//           {/* Action Buttons */}
//           <Box
//             sx={{
//               display: "flex",
//               gap: 2,
//               justifyContent: "flex-end",
//               mt: 4,
//               pt: 3,
//               borderTop: "1px solid rgba(255, 255, 255, 0.1)",
//             }}
//           >
//             <Button
//               variant="outlined"
//               onClick={handleClose}
//               sx={{
//                 borderRadius: 3,
//                 textTransform: "none",
//                 px: 3,
//                 py: 1.5,
//                 background: "rgba(255, 255, 255, 0.1)",
//                 backdropFilter: "blur(10px)",
//                 border: "1px solid rgba(255, 255, 255, 0.2)",
//                 color: "rgba(255, 255, 255, 0.9)",
//                 "&:hover": {
//                   background: "rgba(255, 255, 255, 0.15)",
//                   border: "1px solid rgba(255, 255, 255, 0.3)",
//                 },
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="contained"
//               data-testid="handle-goals-button"
//               onClick={handleStock}
//               sx={{
//                 borderRadius: 3,
//                 textTransform: "none",
//                 px: 3,
//                 py: 1.5,
//                 background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//                 backdropFilter: "blur(10px)",
//                 border: "1px solid rgba(255, 255, 255, 0.2)",
//                 boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
//                 "&:hover": {
//                   background:
//                     "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
//                   transform: "translateY(-1px)",
//                   boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
//                 },
//               }}
//             >
//               {type === "edit" ? "Update Transaction" : "Create Transaction"}
//             </Button>
//           </Box>
//         </Box>
//       </StyledModal>
//     </ThemeProvider>
//   );
// };

// export default StocksModal;
