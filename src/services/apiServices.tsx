
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
