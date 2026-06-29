"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { accountingTableWrapClass } from "../shared/accounting-styles";
import { SuppliersSkeleton } from "./SuppliersSkeleton";
import { SuppliersError } from "./SuppliersError";
import { SuppliersEmpty } from "./SuppliersEmpty";
import { SuppliersTable } from "./SuppliersTable";
import { SupplierEditDialog } from "./SupplierEditDialog";
import { SupplierDeleteDialog } from "./SupplierDeleteDialog";
import { SupplierCreateDialog } from "./SupplierCreateDialog";

import { useSuppliers } from "@/hooks/queries/admin/suppliers/useSuppliers";
import {
  CreateSupplierInput,
  Supplier,
  UpdateSupplierInput,
} from "@repo/types";
import { useCreateSupplier } from "@/hooks/mutations/admin/suppliers/useCreateSupplier";
import { useUpdateSupplier } from "@/hooks/mutations/admin/suppliers/useUpdateSupplier";
import { useDeleteSupplier } from "@/hooks/mutations/admin/suppliers/useDeleteSupplier";

export function SuppliersClient() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

  const { data, isPending, isError, error, refetch } = useSuppliers(page);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if (e.key.toLowerCase() === "a") setCreateOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const handleCreate = async (data: CreateSupplierInput) => {
    await createSupplier.mutateAsync(data);
  };

  const handleEdit = async (id: string, data: UpdateSupplierInput) => {
    await updateSupplier.mutateAsync({
      supplierID: id,
      ...data,
      companyName: data.companyName!,
    });
    setEditSupplier(null);
  };

  const handleDelete = async (id: string) => {
    await deleteSupplierMutation.mutateAsync({ supplierID: id });
    setDeleteSupplier(null);
  };

  return (
    <AdminPageLayout
      title="Suppliers"
      description="Manage your supplier accounts and contact details."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Supplier
        </button>
      }
    >
      <div className="min-h-80">
        {isPending ? (
          <SuppliersSkeleton />
        ) : isError || error ? (
          <div className={accountingTableWrapClass}>
            <SuppliersError
              message={error?.response?.data.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : data?.meta.total === 0 ? (
          <div className={accountingTableWrapClass}>
            <SuppliersEmpty onAdd={() => setCreateOpen(true)} />
          </div>
        ) : data ? (
          <SuppliersTable
            suppliers={data.suppliers}
            meta={data.meta}
            onEdit={setEditSupplier}
            onDelete={setDeleteSupplier}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <SupplierCreateDialog
        open={createOpen}
        loading={createSupplier.isPending}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <SupplierEditDialog
        supplier={editSupplier}
        loading={updateSupplier.isPending}
        onClose={() => setEditSupplier(null)}
        onSave={(id, data) => handleEdit(id, data)}
      />
      <SupplierDeleteDialog
        supplier={deleteSupplier}
        loading={deleteSupplierMutation.isPending}
        onClose={() => setDeleteSupplier(null)}
        onConfirm={handleDelete}
      />
    </AdminPageLayout>
  );
}
