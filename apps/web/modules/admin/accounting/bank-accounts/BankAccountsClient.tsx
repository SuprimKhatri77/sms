"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { accountingTableWrapClass } from "../shared/accounting-styles";
import { BankAccountSkeleton } from "./BankAccountSkeleton";
import { BankAccountsError } from "./BankAccountsError";
import { BankAccountsEmpty } from "./BankAccountEmpty";
import { BankAccountsTable } from "./BankAccountsTable";
import { BankAccountCreateDialog } from "./BankAccountCreateDialog";
import { BankAccountEditDialog } from "./BankAccountEditDialog";
import { BankAccountDeleteDialog } from "./BankAccountDeleteDialog";
import { useBankAccounts } from "@/hooks/queries/admin/banks/bank_accounts/useBankAccounts";
import {
  BankAccount,
  CreateBankAccountInput,
  UpdateBankAccountInput,
} from "@repo/types";
import { useBanks } from "@/hooks/queries/admin/banks/bank_accounts/useBanks";
import { useCreateBankAccount } from "@/hooks/mutations/admin/bank_accounts/useCreateBankAccount";
import { useUpdateBankAccount } from "@/hooks/mutations/admin/bank_accounts/useUpdateBankAccount";
import { useDeleteBankAccount } from "@/hooks/mutations/admin/bank_accounts/useDeleteBankAccount";
import { useSetDefaultBankAccount } from "@/hooks/mutations/admin/bank_accounts/useSetDefaultBankAccount";

export function BankAccountsClient() {
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<BankAccount | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { isPending, isError, error, refetch, data } = useBankAccounts(page);
  const {
    // isPending: isFetchingBanks,
    // isError: isBanksError,
    // error: banksError,
    // refetch: refetchBanks,
    data: banksData,
  } = useBanks();

  const createBankAccount = useCreateBankAccount();
  const updateBankAccount = useUpdateBankAccount();
  const deleteBankAccount = useDeleteBankAccount();
  const setDefaultBankAccount = useSetDefaultBankAccount();

  const handleCreate = async (
    data: CreateBankAccountInput & { bankID: string },
  ) => {
    await createBankAccount.mutateAsync({ ...data });
  };

  const handleEdit = async (
    data: UpdateBankAccountInput & { accountID: string },
  ) => {
    await updateBankAccount.mutateAsync({ ...data });
    setEditAccount(null);
  };

  const handleDelete = async (accountID: string) => {
    await deleteBankAccount.mutateAsync({ accountID });
    setDeleteAccount(null);
  };

  const handleToggleDefault = async (accountID: string) => {
    setTogglingId(accountID);
    try {
      await setDefaultBankAccount.mutateAsync({ accountID });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminPageLayout
      title="Bank Accounts"
      description="Manage accounts linked to your banks for payment processing."
      maxWidth="wide"
      action={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className={adminPrimaryButtonClass}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Account
        </button>
      }
    >
      <div className="min-h-80">
        {isPending ? (
          <BankAccountSkeleton />
        ) : isError || error ? (
          <div className={accountingTableWrapClass}>
            <BankAccountsError
              message={error?.message ?? "Something went wrong"}
              onRetry={refetch}
            />
          </div>
        ) : data?.meta.total === 0 ? (
          <div className={accountingTableWrapClass}>
            <BankAccountsEmpty onAdd={() => setCreateOpen(true)} />
          </div>
        ) : data ? (
          <BankAccountsTable
            accounts={data.bankAccounts}
            meta={data.meta}
            togglingId={togglingId}
            onEdit={setEditAccount}
            onDelete={setDeleteAccount}
            onToggleDefault={handleToggleDefault}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <BankAccountCreateDialog
        open={createOpen}
        loading={createBankAccount.isPending}
        bankOptions={banksData ?? []}
        loadingOptions={false}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />
      <BankAccountEditDialog
        account={editAccount}
        loading={updateBankAccount.isPending}
        onClose={() => setEditAccount(null)}
        onSave={handleEdit}
      />
      <BankAccountDeleteDialog
        account={deleteAccount}
        loading={deleteBankAccount.isPending}
        onClose={() => setDeleteAccount(null)}
        onConfirm={handleDelete}
      />
    </AdminPageLayout>
  );
}
