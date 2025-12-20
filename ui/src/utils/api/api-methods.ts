
import type { AxiosRequestConfig } from 'axios';
import api from './axios-instance';


export const GetRequest = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  url = url;

  const response = await api.get<T>(url, config);
  return response.data;
};

export const PostRequest = async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const PutRequest = async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

export const DeleteRequest = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};


export const UploadFile = async <T>(url: string, file: File, fieldName: string): Promise<T> => {

  const formData = new FormData();

  formData.append('fileName', file);
  formData.append('fieldName', fieldName);

  const response = await api.post<T>(url, formData, {
    timeout: 30000
  });

  return response.data;

};

export const MergedGetRequest = async (
  api1: string,
  api2: string,
  combineKey: string
): Promise<object[]> => {

  const [data1, data2]: any = await Promise.all([
    GetRequest(api1),
    GetRequest(api2)
  ]);

  const map = new Map();

  // Put all objects from first response into the map
  for (const item of data1) {
    const key = item[combineKey];
    if (key !== undefined) {
      map.set(key, { ...item });
    }
  }

  // Merge matching objects from second response
  for (const item of data2) {

    const key = item[combineKey];

    if (key !== undefined) {
      const existing = map.get(key);
      if (existing) {
        map.set(key, { ...existing, ...item });
      } else {
        map.set(key, { ...item });
      }
    }

  }

  return Array.from(map.values());
  
}
