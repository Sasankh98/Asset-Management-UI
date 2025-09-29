// import { ThemeProvider } from "@mui/material/styles";
// import Box from "@mui/material/Box";
// import FormControl from "@mui/material/FormControl";
// import Grid from "@mui/material/Grid";
// import InputLabel from "@mui/material/InputLabel";
// import MenuItem from "@mui/material/MenuItem";
// import Modal from "@mui/material/Modal";
// import Select from "@mui/material/Select";
// import TextField from "@mui/material/TextField";
// import type { SelectChangeEvent } from "@mui/material/Select";
// // import {
// //   Box,
// //   Grid,
// //   FormControl,
// //   InputLabel,
// //   MenuItem,
// //   Modal,
// //   Select,
// //   TextField,
// // } from "../../../../../core/MUI/components";
// import CustomButton from "../../../../../core/CustomButton/CustomButton";
// import { Theme } from "../../../../../core/MUI/Theme";
// import { useEffect, useState } from "react";
// import "./createStocks.css";
// import StocksService from "../../../../../services/StocksService/StocksService";
// import { CreateStocksDTO } from "../../../../../../server/types";

// interface CreateStocksProps {
//   open: boolean;
//   handleClose: () => void;
// }
// const CreateStocks = (props: CreateStocksProps) => {
//   // const [loader,setLoader] = useState(false)
//   const [show, setShow] = useState(false);
//   const [stocksData, setStocksData] = useState<CreateStocksDTO>({
//     stockName: "",
//     avg: 0,
//     quantity: 0,
//     buyTax: 0,
//     buyDate: "",
//     // SellPrice: "",
//     // Dividends: "",
//     // SellingTax: "",
//     // SellDate: "",
//     user: "Sasankh",
//     status: "active",
//   });

//   const handleCreateStocks = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setStocksData({ ...stocksData, [name]: value });
//   };

//   const handleSelectChange = (event: SelectChangeEvent) => {
//     // event.target.value is the new value.
//     // MUI's Select target may not have exact HTMLInputElement typing for .name,
//     // so cast to access name safely:
//     const target = event.target as HTMLInputElement & { name?: string };
//     const name = target.name;
//     const value = event.target.value;
//     if (!name) return;
//     setStocksData((prev) => ({ ...prev, [name]: value }));
//   };

//   useEffect(() => {
//     if (stocksData.status === "sold") {
//       setShow(true);
//     }
//   }, [stocksData.status]);
//   const handleSubmit = async () => {
//     props.handleClose();
//     // setLoader(true)
//     try {
//       const response = await StocksService().postStockDetails(stocksData);
//       //   if (response) setLoader(false)
//       console.log(response);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <div>
//       <ThemeProvider theme={Theme}>
//         <Modal open={props.open} onClose={props.handleClose}>
//           <Box
//             sx={{
//               bgcolor: "background.paper",
//               width: 700,
//               boxShadow: 24,
//               p: 4,
//               position: "absolute",
//               borderRadius: "2%",
//               top: "20%",
//               left: "28%",
//               //   transform:"translate(-50%,-50%)"
//             }}
//           >
//             <h2>Create New Stocks</h2>

//             <Grid container spacing={2}>
//               <Grid size={6}>
//                 <FormControl fullWidth sx={{ mb: 2 }}>
//                   <InputLabel id="customer-id-label" shrink>
//                     Stock Status
//                   </InputLabel>
//                   <Select
//                     labelId="demo-simple-select-standard-label"
//                     id="demo-simple-select-standard"
//                     value={stocksData.status}
//                     onChange={handleSelectChange}
//                     label="Status"
//                     name="status"
//                   >
//                     <MenuItem value="active">Active</MenuItem>
//                     <MenuItem value="sold">Sold</MenuItem>
//                     <MenuItem value="archived">Archived</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid size={6}>
//                 <TextField
//                   fullWidth
//                   placeholder="Enter Share Name"
//                   onChange={handleCreateStocks}
//                   name="stockName"
//                 />
//               </Grid>
//             </Grid>
//             <Grid container spacing={2}>
//               <Grid size={4}>
//                 <TextField
//                   placeholder="Enter Average Price"
//                   onChange={handleCreateStocks}
//                   name="avg"
//                 />
//               </Grid>
//               <Grid size={4}>
//                 <TextField
//                   placeholder="Enter Stock Quantity"
//                   onChange={handleCreateStocks}
//                   name="quantity"
//                 />
//               </Grid>
//               <Grid size={4}>
//                 <TextField
//                   placeholder="Enter Buying Tax"
//                   onChange={handleCreateStocks}
//                   name="buyTax"
//                 />
//               </Grid>
//             </Grid>
//             <Grid container spacing={2} sx={{ marginTop: 0 }}>
//               <Grid size={6}>
//                 <TextField
//                   fullWidth
//                   type="date"
//                   placeholder="Buy Date"
//                   onChange={handleCreateStocks}
//                   name="buyDate"
//                 />
//               </Grid>
//               <Grid size={6}>
//                 <TextField
//                   fullWidth
//                   disabled
//                   value="sasankh"
//                   //   placeholder="Enter Stock Quantity"
//                   //   onChange={handleCreateStocks}
//                   name="user"
//                 />
//               </Grid>
//             </Grid>

//             {show && (
//               <>
//                 <Grid container spacing={2} sx={{ marginTop: 0 }}>
//                   <Grid size={4}>
//                     <TextField
//                       placeholder="Enter Sell Price"
//                       onChange={handleCreateStocks}
//                       name="SellPrice"
//                     />
//                   </Grid>

//                   <Grid size={4}>
//                     <TextField
//                       placeholder="Enter Selling Tax"
//                       onChange={handleCreateStocks}
//                       name="sellTax"
//                     />
//                   </Grid>
//                   <Grid size={4}>
//                     <TextField
//                       placeholder="Enter Dividends"
//                       onChange={handleCreateStocks}
//                       name="Dividends"
//                     />
//                   </Grid>
//                 </Grid>
//                 <Grid container spacing={2} sx={{ marginTop: 0 }}>
//                   <Grid size={6}>
//                     <TextField
//                       fullWidth
//                       type="date"
//                       onChange={handleCreateStocks}
//                       name="sellDate"
//                       placeholder="Sell Date"
//                     />
//                   </Grid>
//                 </Grid>
//               </>
//             )}

//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-around",
//                 marginTop: 3,
//               }}
//             >
//               <div>
//                 <CustomButton
//                   text={"Submit"}
//                   customClass={"submit-btn"}
//                   handleClick={handleSubmit}
//                 />
//               </div>
//               <div>
//                 <CustomButton
//                   text={"Close"}
//                   customClass={"close-btn"}
//                   handleClick={handleSubmit}
//                 />
//               </div>
//             </Box>
//           </Box>
//         </Modal>
//       </ThemeProvider>
//     </div>
//   );
// };

// export default CreateStocks;
