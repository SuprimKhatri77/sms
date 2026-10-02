import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  updateProductCategory,
  type UpdateProductCategoryParams,
} from "@/lib/api/product_categories";
import { invalidateInventoryCategoryViews } from "@/lib/inventory-cache";
import { APIError, UpdateProductCategoryResponse } from "@repo/types";

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateProductCategoryResponse,
    AxiosError<APIError>,
    UpdateProductCategoryParams
  >({
    mutationFn: updateProductCategory,
    onSuccess: (result) => {
      toast.success(result.message);
      invalidateInventoryCategoryViews(queryClient);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
