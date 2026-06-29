"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { SettingsLoading } from "./SettingsLoading";
import { SettingsError } from "./SettingsError";
import { SettingsListResponse } from "@repo/types";
import { SettingsUnavailable } from "./SettingsUnavailable";
import { UpdateSetting, UpdateSettingResponse } from "@repo/types/admin";
import { toast } from "sonner";
import { SettingRow } from "./SettingRow";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";

export default function SettingsPage() {
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
  if (!data || !data.success) {
    return (
      <SettingsUnavailable message={data?.message} onRetry={refetch} />
    );
  }

  const settings = data.data;

  return (
    <AdminPageLayout
      title="Site Settings"
      description="Manage global configuration values"
      maxWidth="default"
    >
      <div className="overflow-hidden border border-[rgba(47,78,64,0.18)] bg-white">
        <div className="border-b border-[rgba(47,78,64,0.12)] px-5 py-3">
          <span className="font-[family-name:var(--font-dm-sans)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgba(47,78,64,0.45)]">
            {settings.length} {settings.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {settings.length === 0 ? (
          <div className="px-6 py-12 text-center font-[family-name:var(--font-dm-sans)] text-sm text-[rgba(47,78,64,0.45)]">
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
    </AdminPageLayout>
  );
}
