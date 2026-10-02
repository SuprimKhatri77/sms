import {
  CreateProductCategoryResponse,
  DeleteProductCategoryResponse,
  GetProductCategoriesResponse,
  ProductCategory,
  ProductCategoryInput,
  UpdateProductCategoryResponse,
} from "@repo/types";
import api from "../axios";

export const getProductCategories = async (): Promise<ProductCategory[]> => {
  const res = await api.get<GetProductCategoriesResponse>(
    "/admin/inventory/categories",
  );
  return res.data.data;
};

export const createProductCategory = async (
  data: ProductCategoryInput,
): Promise<CreateProductCategoryResponse> => {
  const res = await api.post<CreateProductCategoryResponse>(
    "/admin/inventory/categories",
    data,
  );
  return res.data;
};

export type UpdateProductCategoryParams = {
  categoryID: string;
  data: ProductCategoryInput;
};

export const updateProductCategory = async ({
  categoryID,
  data,
}: UpdateProductCategoryParams): Promise<UpdateProductCategoryResponse> => {
  const res = await api.put<UpdateProductCategoryResponse>(
    `/admin/inventory/categories/${categoryID}`,
    data,
  );
  return res.data;
};

export const deleteProductCategory = async (
  categoryID: string,
): Promise<DeleteProductCategoryResponse> => {
  const res = await api.delete<DeleteProductCategoryResponse>(
    `/admin/inventory/categories/${categoryID}`,
  );
  return res.data;
};
