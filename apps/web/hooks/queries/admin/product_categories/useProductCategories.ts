import { getProductCategories } from "@/lib/api/product_categories";
import { queryKeys } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { APIError, ProductCategory } from "@repo/types";

export const useProductCategories = () => {
  return useQuery<ProductCategory[], AxiosError<APIError>>({
    queryKey: queryKeys.productCategories.all,
    queryFn: getProductCategories,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};
