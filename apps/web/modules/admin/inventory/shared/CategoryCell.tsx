import { inventoryTdClass } from "./inventory-styles";

// Category path cell shared by the inventory tables; "—" when the product
// has no category.
export function CategoryCell({ path }: { path: string | null }) {
  return (
    <td
      className={`${inventoryTdClass} max-w-[220px] truncate text-[rgba(47,78,64,0.6)]`}
      title={path ?? undefined}
    >
      {path ?? <span className="italic text-[rgba(47,78,64,0.35)]">—</span>}
    </td>
  );
}
