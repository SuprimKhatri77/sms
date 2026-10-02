import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { deleteProductCategory } from "@/lib/api/product_categories";
import { invalidateInventoryCategoryViews } from "@/lib/inventory-cache";
import { APIError, DeleteProductCategoryResponse } from "@repo/types";

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteProductCategoryResponse,
    AxiosError<APIError>,
    string
  >({
    mutationFn: deleteProductCategory,
    onSuccess: (result) => {
      toast.success(result.message);
      invalidateInventoryCategoryViews(queryClient);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? "Something went wrong");
    },
  });
};
