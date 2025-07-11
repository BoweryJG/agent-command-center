import { useState, useCallback } from 'react';
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';
import { AxiosError, AxiosRequestConfig } from 'axios';

interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

interface UseApiOptions<TData = any> extends Omit<UseQueryOptions<TData, ApiError>, 'queryKey' | 'queryFn'> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: any;
  data?: any;
  config?: AxiosRequestConfig;
}

interface UseMutationApiOptions<TData = any, TVariables = any> 
  extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  url: string | ((variables: TVariables) => string);
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  config?: AxiosRequestConfig;
}

// Custom hook for API queries
export const useApi = <TData = any>({
  url,
  method = 'GET',
  params,
  data,
  config,
  ...queryOptions
}: UseApiOptions<TData>) => {
  return useQuery<TData, ApiError>({
    queryKey: [url, params],
    queryFn: async () => {
      try {
        const response = await axiosInstance.request<TData>({
          url,
          method,
          params,
          data,
          ...config,
        });
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw {
            message: error.response?.data?.message || error.message,
            code: error.code,
            details: error.response?.data,
          };
        }
        throw { message: 'An unexpected error occurred' };
      }
    },
    ...queryOptions,
  });
};

// Custom hook for API mutations
export const useApiMutation = <TData = any, TVariables = any>({
  url,
  method = 'POST',
  config,
  ...mutationOptions
}: UseMutationApiOptions<TData, TVariables>) => {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      try {
        const finalUrl = typeof url === 'function' ? url(variables) : url;
        const response = await axiosInstance.request<TData>({
          url: finalUrl,
          method,
          data: variables,
          ...config,
        });
        return response.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw {
            message: error.response?.data?.message || error.message,
            code: error.code,
            details: error.response?.data,
          };
        }
        throw { message: 'An unexpected error occurred' };
      }
    },
    ...mutationOptions,
  });
};

// Custom hook for manual API calls
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const call = useCallback(async <TData = any>(
    url: string,
    options?: AxiosRequestConfig
  ): Promise<TData> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.request<TData>({
        url,
        ...options,
      });
      return response.data;
    } catch (err) {
      let apiError: ApiError;
      
      if (err instanceof AxiosError) {
        apiError = {
          message: err.response?.data?.message || err.message,
          code: err.code,
          details: err.response?.data,
        };
      } else {
        apiError = { message: 'An unexpected error occurred' };
      }
      
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
};