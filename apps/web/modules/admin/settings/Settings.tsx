"use client";

import { Settings, ChevronRight } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { SettingsLoading } from "./SettingsLoading";
import { SettingsError } from "./SettingsError";
import { SettingsListResponse } from "@repo/types";
import { SettingsUnavailable } from "./SettingsUnavailable";
import { UpdateSetting, UpdateSettingResponse } from "@repo/types/admin";
import { toast } from "sonner";
import { SettingRow } from "./SettingRow";

const GLOBAL_STYLES = `
  @keyframes fade-in  { from { opacity: 0 }               to { opacity: 1 } }
  @keyframes slide-up { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }

  .animate-fade-in  { animation: fade-in  0.15s ease; }
  .animate-slide-up { animation: slide-up 0.18s ease; }
`;

export default function SettingsPage() {
  // const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await api.get<SettingsListResponse>("/admin/settings");
      return res.data;
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: async ({ key, value }: UpdateSetting) => {
      const res = await api.put<UpdateSettingResponse>(
        `/admin/settings/${key}`,
        { value },
      );
      if (!res.data.success) throw new Error(res.data.message);
      return res.data;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["admin-settings"] });
      const previousSettings = queryClient.getQueryData(["admin-settings"]);

      const optimisticSetting = {
        key: data.key,
        value: data.value,
      };

      queryClient.setQueryData<SettingsListResponse>(
        ["admin-settings"],
        (old) => {
          if (!old || !old.success) return old;

          return {
            ...old,
            data: old.data.map((s) =>
              s.key === optimisticSetting.key ? optimisticSetting : s,
            ),
          };
        },
      );

      return { previousSettings };
    },

    onSuccess: (result) => {
      toast.success(result.message);
    },
    onError: (error, _, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(["admin-settings"], context.previousSettings);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });
  if (isPending) return <SettingsLoading />;
  if (isError) return <SettingsError onRetry={refetch} />;
  if (!data || !data.success)
    return <SettingsUnavailable message={data.message} onRetry={refetch} />;

  const settings = data.data;

  // const handleAdd = (key: string, value: string) => {};

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div className="min-h-screen bg-(--brand-cream) px-4 py-8">
        <div className="max-w-[760px] mx-auto">
          {/* Local context pill */}
          <div className="mb-6 flex items-center gap-1 text-xs text-[rgba(47,78,64,0.45)]">
            <span className="text-[rgba(47,78,64,0.7)]">Admin</span>
            <ChevronRight size={12} />
            <span className="text-[rgba(47,78,64,0.7)]">Settings</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[rgba(194,138,79,0.14)] text-(--brand-brown)">
                <Settings size={20} />
              </div>
              <div>
                <h1 className="text-[1.375rem] font-bold tracking-tight text-(--brand-green)">
                  Site Settings
                </h1>
                <p className="mt-0.5 text-[0.8125rem] text-[rgba(47,78,64,0.55)]">
                  Manage global configuration values
                </p>
              </div>
            </div>
            {/* <button
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white border-0 rounded-lg px-4 py-2 text-[0.8125rem] font-semibold cursor-pointer hover:bg-blue-700 transition-colors whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              <Plus size={15} /> Add Setting
            </button> */}
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-[10px] border border-[rgba(47,78,64,0.14)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[rgba(47,78,64,0.14)] px-5 py-3.5">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-[rgba(47,78,64,0.45)]">
                {settings.length} {settings.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {settings.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[rgba(47,78,64,0.45)]">
                No settings configured yet.
              </div>
            ) : (
              settings.map((s) => (
                <SettingRow
                  key={s.key}
                  setting={s}
                  onSave={(key, value) => updateSettings({ key, value })}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* {showModal && (
        <AddSettingModal
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
          existingKeys={settings.map((s) => s.key)}
        />
      )} */}
    </>
  );
}
