"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AxiosError } from "axios";
import { APIError, Bank } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { accountingTableWrapClass } from "../shared/accounting-styles";
import { BanksData, fetchBanks } from "@/lib/api/banks";
import { useCreateBank } from "@/hooks/mutations/admin/banks/useCreateBank";
import { useUpdateBank } from "@/hooks/mutations/admin/banks/useUpdateBank";
import { useDeleteBank } from "@/hooks/mutations/admin/banks/useDeleteBank";
import { useSetDefaultBank } from "@/hooks/mutations/admin/banks/useSetDefaultBank";

import { BankSkeleton } from "./BanksSekeleton";
import { BanksError } from "./BanksError";
import { BanksEmpty } from "./BanksEmpty";
import { BanksTable } from "./BanksTable";
import { BankCreateDialog } from "./BankCreateDialog";
import { BankEditDialog } from "./BankEditDialog";
import { BankDeleteDialog } from "./BankDeleteDialog";

export function BanksClient() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBank, setEditBank] = useState<Bank | null>(null);
  const [deleteBank_, setDeleteBank] = useState<Bank | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery<
    BanksData,
    AxiosError<APIError>
  >({
    queryKey: ["admin-banks", page],
    queryFn: () => fetchBanks(page ?? 1),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key.toLowerCase() === "a") setCreateOpen(true);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const createBank = useCreateBank(page);
  const updateBank = useUpdateBank();
  const deleteBank = useDeleteBank();
  const setDefaultBank = useSetDefaultBank(page);

  return (
    <AdminPageLayout
      title="Banks"
      description="Manage payment bank accounts for the academy."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Bank
        </button>
      }
    >
      <div className="min-h-80">
        {isPending ? (
          <BankSkeleton />
        ) : isError || error ? (
          <div className={accountingTableWrapClass}>
            <BanksError
              message={error?.response?.data.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : data?.meta.total === 0 ? (
          <div className={accountingTableWrapClass}>
            <BanksEmpty onAdd={() => setCreateOpen(true)} />
          </div>
        ) : data ? (
          <BanksTable
            banks={data.banks}
            meta={data.meta}
            toggleLoadingId={toggleLoadingId}
            onEdit={setEditBank}
            onDelete={setDeleteBank}
            onToggleDefault={async (bankID) => {
              try {
                setToggleLoadingId(bankID);
                await setDefaultBank.mutateAsync({ bankID });
              } finally {
                setToggleLoadingId(null);
              }
            }}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <BankCreateDialog
        open={createOpen}
        loading={createBank.isPending}
        onClose={() => setCreateOpen(false)}
        onCreate={async (name) => {
          await createBank.mutateAsync({ name });
        }}
      />
      <BankEditDialog
        bank={editBank}
        loading={updateBank.isPending}
        onClose={() => setEditBank(null)}
        onSave={async (id, name) => {
          await updateBank.mutateAsync({ bankID: id, name });
        }}
      />
      <BankDeleteDialog
        bank={deleteBank_}
        loading={deleteBank.isPending}
        onClose={() => setDeleteBank(null)}
        onConfirm={async (id) => {
          await deleteBank.mutateAsync({ bankID: id });
        }}
      />
    </AdminPageLayout>
  );
}
