import { OpenAPIEndpoint } from "@/lib/openapi-parser";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface EndpointSelectorProps {
  endpoints: OpenAPIEndpoint[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

const methodColors: Record<string, string> = {
  GET: "bg-secondary text-secondary-foreground",
  POST: "bg-primary text-primary-foreground",
  PUT: "bg-accent text-accent-foreground",
  DELETE: "bg-destructive text-destructive-foreground",
  PATCH: "bg-muted text-muted-foreground",
};

export const EndpointSelector = ({
  endpoints,
  selectedIds,
  onToggle,
  onToggleAll,
}: EndpointSelectorProps) => {
  const { t } = useTranslation();
  const allSelected = selectedIds.length === endpoints.length;

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm neon-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="relative flex items-center justify-between mb-4">
        <h3 className="text-xl font-display font-bold text-foreground text-glow-primary">
          {t('endpointSelector.title')}
        </h3>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onToggleAll}
            id="select-all"
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium cursor-pointer"
          >
            {t('endpointSelector.selectAll', { count: endpoints.length })}
          </label>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4 relative">
        <div className="space-y-3">
          {endpoints.map((endpoint) => (
            <Card
              key={endpoint.id}
              className="p-4 hover:bg-muted/50 transition-all duration-300 cursor-pointer hover-glow border-primary/30"
              onClick={() => onToggle(endpoint.id)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(endpoint.id)}
                  onCheckedChange={() => onToggle(endpoint.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={methodColors[endpoint.method]}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-foreground">
                      {endpoint.path}
                    </code>
                  </div>
                  {endpoint.summary && (
                    <p className="text-sm text-foreground font-medium mb-1">
                      {endpoint.summary}
                    </p>
                  )}
                  {endpoint.description && (
                    <p className="text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
