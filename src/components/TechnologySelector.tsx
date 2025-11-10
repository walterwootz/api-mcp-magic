import { Technology } from "@/lib/code-generators";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TechnologySelectorProps {
  selected: Technology;
  onSelect: (tech: Technology) => void;
  lang?: 'en' | 'it';
}

const technologies: Array<{
  id: Technology;
  name: string;
  description: string;
  // URL to an official logo (SimpleIcons CDN)
  iconUrl?: string;
}> = [
  {
    id: "python-mcp",
    name: "Python",
    description: "Official Python SDK for Model Context Protocol",
  iconUrl: "/icons/python.png",
  },
  {
    id: "typescript-mcp",
    name: "TypeScript/Node.js",
    description: "Official TypeScript SDK - production-ready and type-safe",
  iconUrl: "/icons/typescript.png",
  },
  {
    id: "go-mcp",
    name: "Go",
    description: "Official Go SDK for building high-performance MCP servers",
  iconUrl: "/icons/go.png",
  },
  {
    id: "rust-mcp",
    name: "Rust",
    description: "Official Rust SDK for memory-safe, blazingly fast servers",
  iconUrl: "/icons/rust.png",
  },
  {
    id: "java-mcp",
    name: "Java",
    description: "Official Java SDK for enterprise MCP applications",
  iconUrl: "/icons/java.png",
  },
  {
    id: "kotlin-mcp",
    name: "Kotlin",
    description: "Official Kotlin SDK maintained with JetBrains",
  iconUrl: "/icons/kotlin.png",
  },
  {
    id: "csharp-mcp",
    name: "C#",
    description: "Official C# SDK maintained with Microsoft",
    // SimpleIcons uses 'dotnet' for the .NET/C# family
  iconUrl: "/icons/dotnet.png",
  },
  {
    id: "php-mcp",
    name: "PHP",
    description: "Official PHP SDK maintained with The PHP Foundation",
  iconUrl: "/icons/php.png",
  },
  {
    id: "ruby-mcp",
    name: "Ruby",
    description: "Official Ruby SDK for elegant MCP server development",
  iconUrl: "/icons/ruby.png",
  },
  {
    id: "swift-mcp",
    name: "Swift",
    description: "Official Swift SDK for macOS and iOS applications",
  iconUrl: "/icons/swift.png",
  },
];

export const TechnologySelector = ({
  selected,
  onSelect,
  lang = 'en',
}: TechnologySelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-foreground text-glow-primary">
        {lang === 'en' ? 'Select MCP Server Language' : 'Seleziona lingua/SDK MCP'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {lang === 'en' ? 'All options use official SDKs and generate production-ready Model Context Protocol servers.' : 'Tutte le opzioni usano SDK ufficiali e generano server Model Context Protocol pronti per la produzione.'}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {technologies.map((tech) => (
          <Card
            key={tech.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-300 hover-glow",
              "border-2 relative overflow-hidden",
              selected === tech.id
                ? "border-primary bg-primary/10 neon-border"
                : "border-primary/30 hover:border-primary/70"
            )}
            onClick={() => onSelect(tech.id)}
          >
            {selected === tech.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 pointer-events-none" />
            )}
            <div className="relative text-center">
              <div className="mb-2 flex items-center justify-center">
                {tech.iconUrl ? (
                  <img
                    src={tech.iconUrl}
                    alt={`${tech.name} logo`}
                    title={tech.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      // hide the broken image if it fails to load
                      const t = e.currentTarget as HTMLImageElement;
                      t.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-3xl">{tech.name.charAt(0)}</div>
                )}
              </div>
              <h4 className="font-display font-bold text-base text-foreground mb-1">
                {tech.name}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{tech.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
