import { createContext,useContext } from "react";

export const BaseUrlContext = createContext<string | undefined>(undefined);

export const useBaseUrl = () => {
    const baseUrl = useContext(BaseUrlContext);
    return baseUrl?? '/';
}