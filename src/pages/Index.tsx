import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FileUpload } from "@/components/FileUpload";
import { EndpointSelector } from "@/components/EndpointSelector";
import { TechnologySelector } from "@/components/TechnologySelector";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  parseOpenAPIFile,
  parseOpenAPIFromUrl,
  parseOpenAPIContent,
  extractEndpoints,
  OpenAPISpec,
  OpenAPIEndpoint,
} from "@/lib/openapi-parser";
import { generateMCPServer, Technology } from "@/lib/code-generators";
import { generateZipBundle, downloadZip } from "@/lib/zip-generator";
import { Download, Github, Star, GitFork } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [endpoints, setEndpoints] = useState<OpenAPIEndpoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [technology, setTechnology] = useState<Technology>("python-mcp");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedSpec = await parseOpenAPIFile(file);
      const extractedEndpoints = extractEndpoints(parsedSpec);
      
      setSpec(parsedSpec);
      setEndpoints(extractedEndpoints);
      setSelectedIds(extractedEndpoints.map((e) => e.id));
      
      toast({
        title: t('toast.fileLoaded'),
        description: t('toast.foundEndpoints', { count: extractedEndpoints.length }),
      });
    } catch (error) {
      toast({
        title: t('toast.errorParsing'),
        description: error instanceof Error ? error.message : t('toast.unknownError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const parsedSpec = await parseOpenAPIFromUrl(url);
      const extractedEndpoints = extractEndpoints(parsedSpec);
      
      setSpec(parsedSpec);
      setEndpoints(extractedEndpoints);
      setSelectedIds(extractedEndpoints.map((e) => e.id));
      
      toast({
        title: t('toast.specLoaded'),
        description: t('toast.foundEndpoints', { count: extractedEndpoints.length }),
      });
    } catch (error) {
      toast({
        title: t('toast.errorLoadingUrl'),
        description: error instanceof Error ? error.message : t('toast.unknownError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async (content: string) => {
    setIsLoading(true);
    try {
      const parsedSpec = parseOpenAPIContent(content);
      const extractedEndpoints = extractEndpoints(parsedSpec);
      
      setSpec(parsedSpec);
      setEndpoints(extractedEndpoints);
      setSelectedIds(extractedEndpoints.map((e) => e.id));
      
      toast({
        title: t('toast.specParsed'),
        description: t('toast.foundEndpoints', { count: extractedEndpoints.length }),
      });
    } catch (error) {
      toast({
        title: t('toast.errorParsingContent'),
        description: error instanceof Error ? error.message : t('toast.unknownError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEndpoint = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === endpoints.length ? [] : endpoints.map((e) => e.id)
    );
  };

  const handleGenerate = async () => {
    if (!spec || selectedIds.length === 0) {
      toast({
        title: t('toast.nothingToGenerate'),
        description: t('toast.selectEndpoint'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedEndpoints = endpoints.filter((e) =>
        selectedIds.includes(e.id)
      );
      
      const files = generateMCPServer(spec, selectedEndpoints, technology);
      const zipBlob = await generateZipBundle(
        files,
        spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, "-")
      );
      
      downloadZip(
        zipBlob,
        `${spec.info.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-mcp-server.zip`
      );
      
      toast({
        title: t('toast.mcpGenerated'),
        description: t('toast.serverReady', { technology }),
      });
    } catch (error) {
      toast({
        title: t('toast.generationFailed'),
        description: error instanceof Error ? error.message : t('toast.unknownError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
  <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16 relative">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain" 
            />
            <h1 className="text-4xl md:text-7xl font-display font-black text-primary text-glow-primary">
              {t('header.title')}
            </h1>
          </div>
          <div className="flex justify-center mb-6">
            <div className="inline-flex border rounded-md bg-card/50 gap-1">
              <button
                className={"px-3 py-1 text-sm font-medium rounded " + (i18n.language === 'en' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
                onClick={() => i18n.changeLanguage('en')}
              >EN</button>
              <button
                className={"px-3 py-1 text-sm font-medium rounded " + (i18n.language === 'it' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
                onClick={() => i18n.changeLanguage('it')}
              >IT</button>
              <button
                className={"px-3 py-1 text-sm font-medium rounded " + (i18n.language === 'fr' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
                onClick={() => i18n.changeLanguage('fr')}
              >FR</button>
              <button
                className={"px-3 py-1 text-sm font-medium rounded " + (i18n.language === 'es' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
                onClick={() => i18n.changeLanguage('es')}
              >ES</button>
              <button
                className={"px-3 py-1 text-sm font-medium rounded " + (i18n.language === 'de' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')}
                onClick={() => i18n.changeLanguage('de')}
              >DE</button>
            </div>
          </div>
          <p className="text-2xl md:text-3xl text-foreground mb-4 font-bold">
            {t('header.subtitle')}
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('header.description')}
          </p>
          
          {/* Free Forever Banner */}
          <div className="mt-8 mb-6">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-sm border-2 border-primary px-8 py-4 rounded-2xl">
                <p className="text-2xl md:text-3xl font-display font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {t('header.bannerTitle')}
                </p>
                <p className="text-lg md:text-xl font-bold text-foreground mt-2">
                  {t('header.bannerSubtitle')}
                </p>
              </div>
            </div>
          </div>

          {/* Logos row */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {['python','typescript','go','rust','java','kotlin','dotnet','php','ruby','swift'].map((s) => (
              <img key={s} src={`/icons/${s}.png`} alt={`${s} logo`} className="w-10 h-10 object-contain" />
            ))}
          </div>
          
          {/* Feature badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
              <img src="/icons/python.png" alt="Python" className="w-5 h-5" />
              <span className="text-sm font-semibold text-primary">{t('header.badge1')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30">
              <img src="/icons/typescript.png" alt="TypeScript" className="w-5 h-5" />
              <span className="text-sm font-semibold text-secondary">{t('header.badge2')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30">
              <img src="/icons/go.png" alt="Go" className="w-5 h-5" />
              <span className="text-sm font-semibold text-accent">{t('header.badge3')}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto space-y-8">
          {/* File Upload */}
          {!spec && (
            <FileUpload 
              onFileSelect={handleFileSelect} 
              onUrlSubmit={handleUrlSubmit}
              onTextSubmit={handleTextSubmit}
              isLoading={isLoading}
            />
          )}

          {/* Endpoint Selection */}
          {spec && endpoints.length > 0 && (
            <>
              <EndpointSelector
                endpoints={endpoints}
                selectedIds={selectedIds}
                onToggle={handleToggleEndpoint}
                onToggleAll={handleToggleAll}
              />

              {/* Technology Selection */}
              <TechnologySelector
                selected={technology}
                onSelect={setTechnology}
              />

              {/* Generate Button */}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isLoading || selectedIds.length === 0}
                  className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-lg px-8 py-6 font-display font-bold text-background shadow-lg hover-glow relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-glow via-secondary-glow to-accent-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Download className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">{t('buttons.generate')}</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setSpec(null);
                    setEndpoints([]);
                    setSelectedIds([]);
                  }}
                  className="border-primary/50 hover:border-primary text-foreground hover:bg-primary/10 font-semibold"
                >
                  {t('buttons.startOver')}
                </Button>
              </div>
            </>
          )}
        </main>
        
        {/* SEO Content Section */}
        {!spec && (
          <section className="max-w-6xl mx-auto mt-20 space-y-12">
            <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/30">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4 text-glow-primary">
                {t('seo.whatIsTitle')}
              </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {t('seo.whatIsContent1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {t('seo.whatIsContent2')}
                </p>
            </article>
            
            <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-secondary/30">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4 text-glow-secondary">
                {t('seo.howToTitle')}
              </h2>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                  <span><strong className="text-foreground">{t('seo.step1Title')}</strong> {t('seo.step1Content')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold">2</span>
                  <span><strong className="text-foreground">{t('seo.step2Title')}</strong> {t('seo.step2Content')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold">3</span>
                  <span><strong className="text-foreground">{t('seo.step3Title')}</strong> {t('seo.step3Content')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                  <span><strong className="text-foreground">{t('seo.step4Title')}</strong> {t('seo.step4Content')}</span>
                </li>
              </ol>
            </article>
            
            <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-accent/30">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4 text-glow-accent">
                {t('seo.whyTitle')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-2">{t('seo.feature1Title')}</h3>
                  <p className="text-muted-foreground">{t('seo.feature1Content')}</p>
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-secondary mb-2">{t('seo.feature2Title')}</h3>
                  <p className="text-muted-foreground">{t('seo.feature2Content')}</p>
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-accent mb-2">{t('seo.feature3Title')}</h3>
                  <p className="text-muted-foreground">{t('seo.feature3Content')}</p>
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold text-primary mb-2">{t('seo.feature4Title')}</h3>
                  <p className="text-muted-foreground">{t('seo.feature4Content')}</p>
                </div>
              </div>
            </article>
          </section>
        )}
      </div>
      
      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "API to MCP Converter Online Free",
          "applicationCategory": "DeveloperApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Any",
          "description": "Free online tool to convert OpenAPI and Swagger specifications to Model Context Protocol (MCP) servers. Supports multiple official MCP SDKs across popular languages.",
          "featureList": [
            "OpenAPI to MCP conversion",
            "Swagger to MCP server",
            "Generators for Python, TypeScript, Go, Rust, Java, Kotlin, C#, PHP, Ruby, Swift",
            "Free unlimited conversions"
          ]
        })}
      </script>
      
      {/* Footer with Credits */}
      <footer className="mt-20 py-8 border-t border-primary/20">
        <div className="container mx-auto px-4">
          {/* SEO Links Section */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div>
                <h3 className="text-foreground font-display font-bold mb-3">{t('footer.resources')}</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/blog/what-is-mcp" className="text-muted-foreground hover:text-primary transition-colors">
                      {t('footer.whatIsMcp')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog/openapi-best-practices" className="text-muted-foreground hover:text-primary transition-colors">
                      {t('footer.bestPractices')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-display font-bold mb-3">{t('footer.supportedLanguages')}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>{t('footer.pythonSdk')}</li>
                  <li>{t('footer.typescriptSdk')}</li>
                  <li>{t('footer.otherLanguages')}</li>
                  <li>{t('footer.additionalLanguages')}</li>
                </ul>
              </div>
              <div>
                <h3 className="text-foreground font-display font-bold mb-3">{t('footer.about')}</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a 
                      href="https://github.com/walterwootz/api-mcp-magic" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      <Github className="w-4 h-4" />
                      {t('footer.githubRepo')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://github.com/walterwootz/api-mcp-magic/stargazers" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      {t('footer.starOnGithub')}
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://github.com/walterwootz/api-mcp-magic/fork" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                      <GitFork className="w-4 h-4" />
                      {t('footer.forkProject')}
                    </a>
                  </li>
                  <li className="text-muted-foreground">{t('footer.freeForever')}</li>
                  <li className="text-muted-foreground">{t('footer.clientSide')}</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center border-t border-primary/10 pt-6">
            <p className="text-muted-foreground text-sm md:text-base">
              {t('footer.openSource')} <span className="text-red-500 animate-pulse">❤️</span>
            </p>
            <p className="text-muted-foreground/70 text-xs md:text-sm mt-2">
              <a 
                href="https://github.com/walterwootz/api-mcp-magic" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:text-secondary transition-colors underline decoration-primary/30 hover:decoration-secondary inline-flex items-center gap-1"
              >
                <Github className="w-3 h-3" />
                github.com/walterwootz/api-mcp-magic
              </a>
            </p>
            <p className="text-muted-foreground/70 text-xs mt-2">
              {t('footer.license')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
