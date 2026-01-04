const token = sessionStorage.getItem("token");

export const baseURL = "http://localhost:4000/api";

import { getTimeStamp } from "../utils/dateTime";

export const getUniqueParams = (fullPath: string | undefined) => {
  return fullPath?.includes("?")
    ? `&timestamp=${getTimeStamp()}`
    : `?timestamp=${getTimeStamp()}`;
};

const setConfig = async (config?: RequestInit) => {
  return {
    ...config,
    headers: {
      // ...config?.headers,
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

function sanitizeInput(input: string): string {
  return input
    .replaceAll(/[\r\n]/g, " ")
    .replaceAll(/"/g, '\\"')
    .replaceAll(/'/g, "\\'");
}

const logResponseError = async (urlPath: string, errorMessage: string) => {
  const sanitizedUrlPath = sanitizeInput(urlPath);
  const sanitizedErrorMessage = sanitizeInput(errorMessage);
  console.log(
    `Error in API call to ${sanitizedUrlPath}: ${sanitizedErrorMessage}`
  );
};

const logError = (urlPath: string, error: unknown) => {
  console.log(`Error in API call to ${urlPath}:`, error);
};

export async function get<T>(
  fullPath?: string,
  customConfig?: RequestInit
): Promise<T | null> {
  const urlPath = fullPath + getUniqueParams(fullPath);
  customConfig = await setConfig(customConfig);
  try {
    const response = await fetch(urlPath, { ...customConfig, method: "GET" });
    if (!response.ok) {
      const errorMessage = await response.text();
      await logResponseError(urlPath, errorMessage);
      return await Promise.reject(response);
    }
    if (response.status === 204) return null;
    const result: T = (await response.json()) as T;
    return result;
  } catch (error) {
    logError(urlPath, error);
    throw error;
  }
}

export async function post<T, R>(
  fullPath?: string,
  body?: T,
  customConfig?: RequestInit
): Promise<R | unknown> {
  const urlPath = fullPath + getUniqueParams(fullPath);
  customConfig = await setConfig(customConfig);
  try {
    const response = await fetch(urlPath, {
      ...customConfig,
      body: JSON.stringify(body),
      method: "POST",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      await logResponseError(urlPath, errorMessage);
      return await Promise.reject(new Error(errorMessage));
    }
    if (response.status === 204) return null;
    const result: R = (await response.json()) as R;
    return result;
  } catch (error) {
    logError(urlPath, error);
    throw error;
  }
}

export async function patch<T, R>(
  fullPath?: string,
  body?: T,
  customConfig?: RequestInit
): Promise<R | unknown> {
  const urlPath = fullPath + getUniqueParams(fullPath);
  customConfig = await setConfig(customConfig);
  try {
    const response = await fetch(urlPath, {
      ...customConfig,
      body: JSON.stringify(body),
      method: "PATCH",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      await logResponseError(urlPath, errorMessage);
      return await Promise.reject(new Error(errorMessage));
    }
    if (response.status === 204) return null;
    const result: R = (await response.json()) as R;
    return result;
  } catch (error) {
    logError(urlPath, error);
    throw error;
  }
}

export async function put<T, R>(
  fullPath?: string,
  body?: T,
  customConfig?: RequestInit
): Promise<R | null> {
  const urlPath = fullPath + getUniqueParams(fullPath);
  customConfig = await setConfig(customConfig);
  try {
    const response = await fetch(urlPath, {
      ...customConfig,
      body: JSON.stringify(body),
      method: "PUT",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      await logResponseError(urlPath, errorMessage);
      return await Promise.reject(new Error(errorMessage));
    }
    if (response.status === 204) return null;
    const result: R = (await response.json()) as R;
    return result;
  } catch (error) {
    logError(urlPath, error);
    throw error;
  }
}

export const httpService = {
  get,
  post,
  patch,
  put,
};
