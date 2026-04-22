"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { StatsBar } from "./StatsBar";
import { PAGE_SIZE } from "@/utils/mock";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserCard } from "./EditUserCard";
import { UsersTable } from "./UserTable";
import { Pagination } from "./Pagination";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { User, UsersList } from "@repo/types";
import { UsersTableSkeleton } from "./UserTableSkeleton";
import { UsersErrorState } from "./UserErrorState";
import { UsersEmptyState } from "./UserEmptyState";

export function UsersPageClient() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: async () => {
      const res = await api.get<UsersList>(`/admin/users?page=${page}`);
      return res.data;
    },
    staleTime: 10 * 60 * 60,
    gcTime: 10 * 60 * 60,
  });

  if (isPending) return <UsersTableSkeleton />;
  if (isError || error) return <UsersErrorState />;

  const users = data?.data;
  const totalUsers = data?.total ?? 0; // total record count from API
  const totalPages = data?.totalPages ?? 1; // total pages from API

  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalUsers);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-black uppercase">
            Users
          </h1>
          <p className="font-mono text-xs text-zinc-500 tracking-widest mt-1">
            {totalUsers} total
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors border border-black self-start sm:self-auto"
        >
          <Plus size={14} />
          Create User
        </button>
      </div>

      {/* Empty state */}
      {users?.length === 0 && (
        <UsersEmptyState onCreateUser={() => setIsCreateOpen(true)} />
      )}

      {/* Normal state */}
      {users && users.length > 0 && (
        <>
          <StatsBar users={users} />
          <UsersTable users={users} onRowClick={setSelectedUser} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <p className="font-mono text-xs text-zinc-500 tracking-wide">
              Showing {start}&ndash;{end} of {totalUsers} users
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <EditUserCard user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}
