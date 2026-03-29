import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Service } from "@/hooks/api/useServices";
import type { SortKey } from "@/pages/services/servicesPageUtils";

type ServicesTableProps = {
  services: Service[];
  onSort: (key: SortKey) => void;
  sortIndicator: (key: SortKey) => string;
  onExecuteService: (serviceId: string) => void;
};

export function ServicesTable({
  services,
  onSort,
  sortIndicator,
  onExecuteService,
}: ServicesTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              <button type="button" onClick={() => onSort("id")} className="hover:text-foreground">
                ID{sortIndicator("id")}
              </button>
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              <button type="button" onClick={() => onSort("name")} className="hover:text-foreground">
                サービス名{sortIndicator("name")}
              </button>
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              <button type="button" onClick={() => onSort("category")} className="hover:text-foreground">
                カテゴリ{sortIndicator("category")}
              </button>
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">
              <button type="button" onClick={() => onSort("owner")} className="hover:text-foreground">
                担当{sortIndicator("owner")}
              </button>
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-medium">実行</th>
          </tr>
        </thead>

        <tbody>
          {services.map((service, index) => (
            <tr
              key={service.id}
              className={index % 2 === 0 ? "border-t bg-background hover:bg-accent/40" : "border-t bg-muted/20 hover:bg-accent/40"}
            >
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">
                <Link
                  to={`/services/${encodeURIComponent(service.id)}`}
                  className="text-sky-700 underline-offset-2 hover:underline"
                >
                  {service.id}
                </Link>
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium">{service.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.category}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{service.owner}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => onExecuteService(service.id)}
                >
                  実行
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
