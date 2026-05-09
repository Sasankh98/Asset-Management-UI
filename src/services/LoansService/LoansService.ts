import { type Loan, type CreateLoanDTO } from "../../../server/types";
import { httpService, baseURL } from "../axiosConnection";

function LoansService() {
  return {
    getLoans: async (): Promise<Loan[]> => {
      const res = await httpService.get<{ status: string; data: Loan[] }>(`${baseURL}/loans`);
      return res?.data ?? [];
    },
    createLoan: async (data: CreateLoanDTO): Promise<Loan> => {
      const res = await httpService.post<CreateLoanDTO, { status: string; data: Loan }>(
        `${baseURL}/loans`,
        data
      );
      return res.data;
    },
    updateLoan: async (id: number, data: CreateLoanDTO): Promise<void> => {
      await httpService.patch<CreateLoanDTO, unknown>(`${baseURL}/loans?id=${id}`, data);
    },
    deleteLoan: async (id: number): Promise<void> => {
      await httpService.del(`${baseURL}/loans/${id}`);
    },
  };
}

export default LoansService;
