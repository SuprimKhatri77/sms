"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Plus, Search, ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedCallback } from "use-debounce";

import { StatsBar } from "./StatsBar";
import { CreateUserModal } from "./CreateUserModal";
// import { EditUserCard } from "./EditUserCard";
import { UsersTable } from "./UserTable";
import { Pagination } from "./Pagination";
import api from "@/lib/axios";
// import { User, UsersList } from "@repo/types";
import { UsersList } from "@repo/types";
import { UsersTableSkeleton } from "./UserTableSkeleton";
import { UsersErrorState } from "./UserErrorState";
import { UsersEmptyState } from "./UserEmptyState";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import {
  useAdminEscapeShortcut,
  useAdminClearFiltersShortcut,
  useAdminFocusSearchShortcut,
  useAdminNewShortcut,
  useAdminRefreshShortcut,
} from "@/components/admin/admin-shortcut-provider";
import { useAdminQueryRefresh } from "@/hooks/useAdminQueryRefresh";
import {
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/utils";

type Role = "admin" | "instructor" | "student" | "all";

const ROLES: { label: string; value: Role }[] = [
  { label: "All Roles", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Instructor", value: "instructor" },
  { label: "Student", value: "student" },
];

export function UsersPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Edit user — disabled for now; re-enable when backend supports it again.
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleCreate = useCallback(
    () => setIsCreateOpen((open) => !open),
    [],
  );
  const focusSearch = useCallback(() => searchInputRef.current?.focus(), []);
  const handleEscape = useCallback(() => {
    if (isCreateOpen) setIsCreateOpen(false);
    // else if (selectedUser) setSelectedUser(null);
    else if (roleOpen) setRoleOpen(false);
  }, [isCreateOpen, roleOpen]);

  useAdminNewShortcut(toggleCreate);
  useAdminFocusSearchShortcut(focusSearch);
  useAdminEscapeShortcut(handleEscape);

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";
  const role = (searchParams.get("role") as Role) ?? "all";

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "" || (k === "page" && v === "1")) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      if ("search" in updates || "role" in updates) {
        params.delete("page");
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateParams({ search: value || null });
  }, 400);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  }

  function clearSearch() {
    setSearchInput("");
    updateParams({ search: null });
  }

  const clearAllFilters = useCallback(() => {
    setSearchInput("");
    updateParams({ search: null, role: null, page: null });
  }, [updateParams]);

  function handleRoleSelect(value: Role) {
    setRoleOpen(false);
    updateParams({ role: value === "all" ? null : value });
  }

  function handlePageChange(newPage: number) {
    updateParams({ page: newPage === 1 ? null : String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const queryString = (() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    if (search) p.set("search", search);
    if (role && role !== "all") p.set("role", role);
    return p.toString();
  })();

  const { data, isPending, isRefetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-users", page, search, role],
    queryFn: async () => {
      const res = await api.get<UsersList>(`/admin/users?${queryString}`);
      return res.data;
    },
    staleTime: 10 * 60 * 60,
    gcTime: 10 * 60 * 60,
  });

  useAdminRefreshShortcut(useAdminQueryRefresh(refetch));
  useAdminClearFiltersShortcut(clearAllFilters);

  const users = data?.data;
  const totalUsers = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;
  const start = (data?.meta.offset ?? 0) + 1;
  const end = (data?.meta.offset ?? 0) + (users?.length ?? 0);

  const currentRoleLabel = ROLES.find((r) => r.value === role)?.label ?? "All";
  const hasActiveFilters = search || role !== "all";
  const isInitialLoading = isPending && !data;
  const isInitialError = isError && !data;
  const errorMessage =
    error instanceof Error ? error.message : "Something went wrong";

  return (
    <AdminPageLayout
      title="Users"
      description={
        isInitialLoading
          ? "Loading user accounts…"
          : isRefetching
            ? "Refreshing user accounts…"
            : `${totalUsers} accounts in the system`
      }
      maxWidth="wide"
      action={
        <button
          onClick={() => setIsCreateOpen(true)}
          className={adminPrimaryButtonClass}
        >
          <Plus size={14} />
          Create User
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[rgba(47,78,64,0.4)]"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by name or email…"
              className={`${adminInputClass} py-2.5 pr-8 pl-8`}
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[rgba(47,78,64,0.4)] transition-colors hover:text-(--brand-green)"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setRoleOpen((o) => !o)}
              className={`${adminInputClass} flex min-w-[160px] items-center justify-between gap-2 py-2.5`}
            >
              <span>{currentRoleLabel}</span>
              <ChevronDown
                size={13}
                className={`transition-transform ${roleOpen ? "rotate-180" : ""}`}
              />
            </button>

            {roleOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRoleOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] border border-[rgba(47,78,64,0.18)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRoleSelect(r.value)}
                      className={`w-full px-4 py-2.5 text-left font-(family-name:--font-dm-sans) text-xs font-semibold uppercase tracking-[0.06em] transition-colors hover:bg-[rgba(47,78,64,0.04)] ${
                        role === r.value
                          ? "bg-[rgba(47,78,64,0.06)] text-(--brand-green)"
                          : "text-[rgba(47,78,64,0.7)]"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
              Filters
            </span>
            {role !== "all" && (
              <span className="inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.18)] bg-white px-2.5 py-1 font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.08em] text-(--brand-green)">
                Role: {currentRoleLabel}
                <button
                  onClick={() => handleRoleSelect("all")}
                  className="text-[rgba(47,78,64,0.4)] hover:text-(--brand-green)"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 border border-[rgba(47,78,64,0.18)] bg-white px-2.5 py-1 font-(family-name:--font-dm-sans) text-[10px] text-(--brand-green)">
                &ldquo;{search}&rdquo;
                <button
                  onClick={clearSearch}
                  className="text-[rgba(47,78,64,0.4)] hover:text-(--brand-green)"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="font-(family-name:--font-dm-sans) text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(47,78,64,0.45)] underline underline-offset-2 transition-colors hover:text-(--brand-green)"
            >
              Clear all
            </button>
          </div>
        )}

        {isInitialLoading ? (
          <UsersTableSkeleton />
        ) : isInitialError ? (
          <UsersErrorState
            variant="inline"
            message={errorMessage}
            onRetry={() => void refetch()}
          />
        ) : users?.length === 0 ? (
          <UsersEmptyState
            role={role === "all" ? "users" : role}
            onCreateUser={() => setIsCreateOpen(true)}
          />
        ) : users && users.length > 0 ? (
          <div
            className={cn(
              "space-y-6 transition-opacity",
              isRefetching && "pointer-events-none opacity-60",
            )}
          >
            <StatsBar
              total={data.meta.total}
              roleCount={{ ...data.meta.roleCounts }}
            />
            <UsersTable users={users} />
            {/* <UsersTable users={users} onRowClick={setSelectedUser} /> */}

            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <p className="font-(family-name:--font-dm-sans) text-xs text-[rgba(47,78,64,0.55)]">
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
          </div>
        ) : null}
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      {/* <EditUserCard user={selectedUser} onClose={() => setSelectedUser(null)} /> */}
    </AdminPageLayout>
  );
}
