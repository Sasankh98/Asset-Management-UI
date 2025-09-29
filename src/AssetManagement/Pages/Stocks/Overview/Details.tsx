// import  { useEffect, useState } from "react";
// import { ConfigMethod, ConfigUrl } from "../../../../config/ConfigAPI";
// import { callAPI } from "../../../../services/apiServices";
// const Details = () => {
//   const [overviewData, setOverviewData] = useState();

//   useEffect(() => {
//     try {
//       callAPI(ConfigUrl.getTotalInvested, ConfigMethod.getMethod).then(
//         (res) => {
//           // console.log(res.response);
//           setOverviewData(res?.response);
//         }
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   }, []);
//   const items = [
//     {
//       label: "Total Invested Amount",
//       // children: `₹ ${overviewData?.TotalInvested}` || "NA",
//       children: "NA",
//     },
//     {
//       label: "Active Invested Amount(24-25)",
//       // children: `₹ ${overviewData?.ActiveInvested[0].activeInvested}` || "NA",
//       children: "NA",
//     },
//     {
//       label: "Net Profit/Loss(24-25)",
//       children: "18:00:00",
//     },
//     {
//       label: "Net Profit/Loss % (24-25)",
//       children: "$80.00",
//     },

//     {
//       label: "Total Tax",
//       children: "$80.00",
//     },
//     {
//       label: "Active Total Tax",
//       children: "$20.00",
//     },
//     {
//       label: "Total Profit/Loss",
//       children: "$60.00",
//     },
//     {
//       label: "Total Profit/Loss %",
//       children: "$60.00",
//     },
//     {
//       label: "Active Profit/Loss",
//       children: "$60.00",
//     },
//     {
//       label: "Net Returns ***",
//       children: "$60.00",
//     },
//   ];
//   return (
//     <Descriptions
//       style={{
//         width: "90%",
//         margin: "1% 0% 2% 5%",
//         border: "1px solid black",
//         paddingTop: "5px",
//       }}
//       title="Overview of Equity Investments"
//       bordered
//       labelStyle={{ fontWeight: "bold" }}
//       column={{
//         xs: 1,
//         sm: 2,
//         md: 3,
//         lg: 3,
//         xl: 4,
//         xxl: 4,
//       }}
//       items={items}
//     />
//   );
// };
// export default Details;
