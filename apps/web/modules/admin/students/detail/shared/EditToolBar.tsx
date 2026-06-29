import { Check, X } from "lucide-react";
import {
  adminPrimaryButtonClass,
  adminIconButtonClass,
} from "@/components/admin/admin-styles";

export function EditToolbar({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        className={adminIconButtonClass}
        aria-label="Cancel"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className={adminPrimaryButtonClass}
        aria-label="Save"
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
