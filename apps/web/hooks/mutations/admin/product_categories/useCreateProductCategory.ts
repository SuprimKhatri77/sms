import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { createProductCategory } from "@/lib/api/product_categories";
import { invalidateInventoryCategoryViews } from "@/lib/inventory-cache";
import {
  APIError,
  CreateProductCategoryResponse,
  ProductCategoryInput,
} from "@repo/types";

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateProductCategoryResponse,
    AxiosError<APIError>,
    ProductCategoryInput
  >({
    mutationFn: createProductCategory,
    onSuccess: (result) => {
      toast.success(result.message);
      invalidateInventoryCategoryViews(queryClient);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
