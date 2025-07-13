// import { getService, postService, patchService } from "./axiosConnection";

// type apiServiceProps = {
//   url: string;
//   method: string;
//   data?: object;
// }

// export const callAPI = async ({url, method, data}:apiServiceProps) => {
//   let response = {};
//   const err = "Method Provided is not valid";
//   if (method === "GET") {
//     response = await getService(url);
//   } else if (method === "POST") {
//     response = await postService(url, data);
//   } else if (method === "PATCH") {
//     response = await patchService(url,data);
//   } else {
//     return err;
//   }
//   return response.data;
// };


import { getService, postService, patchService } from "./axiosConnection";


export const callAPI = async ( url:string, method:string, data?:object) => {
  try {
    let response;

    switch (method) {
      case "GET":
        response = await getService(url);
        break;
      case "POST":
        response = await postService(url, data || {});
        break;
      case "PATCH":
        response = await patchService(url, data || {});
        break;
      default:
        throw new Error("Invalid HTTP method provided");
    }

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error; // rethrowing the error so the caller can handle it
  }
};
