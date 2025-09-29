import { UserLoginDTO, UserInfoDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function loginService() {
  return {
    login: async (data: UserLoginDTO): Promise<UserInfoDTO | null> => {
      try {
        const response = await httpService.post<UserLoginDTO, UserInfoDTO>(
          `${baseURL}/login`,
          data
        );
        return response as UserInfoDTO;
      } catch (error) {
        console.error("Login failed:", error);
        throw error; // rethrowing the error so the caller can handle it
      }
    },
  };
}
export default loginService;
