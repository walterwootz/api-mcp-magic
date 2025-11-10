import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const OpenAPIBestPractices = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToConverter')}
        </Button>

        <article className="bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-primary/30">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4 text-glow-primary">
            {t('blog.bestPractices.title')}
          </h1>
          
          <div className="text-muted-foreground space-y-6">
            <p className="text-lg leading-relaxed">
              {t('blog.bestPractices.intro')}
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.bestPractices.namingTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.bestPractices.namingPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('blog.bestPractices.namingEndpoints')}</strong> {t('blog.bestPractices.namingEndpointsDesc')}</li>
              <li><strong>{t('blog.bestPractices.namingParameters')}</strong> {t('blog.bestPractices.namingParametersDesc')}</li>
              <li><strong>{t('blog.bestPractices.namingSchemas')}</strong> {t('blog.bestPractices.namingSchemasDesc')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.bestPractices.descriptionsTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.bestPractices.descriptionsPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>{t('blog.bestPractices.descriptionsApi')}</li>
              <li>{t('blog.bestPractices.descriptionsOperations')}</li>
              <li>{t('blog.bestPractices.descriptionsParams')}</li>
              <li>{t('blog.bestPractices.descriptionsResponses')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.bestPractices.dataTypesTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.bestPractices.dataTypesPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li><code>string</code> {t('blog.bestPractices.dataTypesString')}</li>
              <li><code>integer</code> {t('blog.bestPractices.dataTypesInteger')}</li>
              <li><code>number</code> {t('blog.bestPractices.dataTypesNumber')}</li>
              <li>{t('blog.bestPractices.dataTypesEnum')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.bestPractices.errorHandlingTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.bestPractices.errorHandlingPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>{t('blog.bestPractices.errorHandlingSchemas')}</li>
              <li>{t('blog.bestPractices.errorHandlingStatus')}</li>
              <li>{t('blog.bestPractices.errorHandlingExamples')}</li>
              <li>{t('blog.bestPractices.errorHandlingMessages')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.bestPractices.securityTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.bestPractices.securityPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Use <code>securitySchemes</code> to define authentication methods</li>
              <li>Apply security requirements at operation or global level</li>
              <li>Document OAuth scopes if applicable</li>
              <li>Include API key header names and locations</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              6. Examples and Samples
            </h2>
            
            <p className="leading-relaxed">
              Provide realistic examples:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Add example requests and responses</li>
              <li>Use <code>example</code> or <code>examples</code> fields in schemas</li>
              <li>Include edge cases in examples</li>
              <li>Show both success and error scenarios</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              7. Versioning
            </h2>
            
            <p className="leading-relaxed">
              Maintain clear API versioning:
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Include version in the API info section</li>
              <li>Consider path-based versioning (e.g., <code>/v1/users</code>)</li>
              <li>Document breaking changes between versions</li>
              <li>Maintain backward compatibility when possible</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              Benefits for MCP Conversion
            </h2>
            
            <p className="leading-relaxed">
              Following these best practices ensures:
            </p>

            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li><strong>Better Code Generation:</strong> Our converter produces cleaner, more maintainable code</li>
              <li><strong>AI-Friendly APIs:</strong> LLMs can better understand and use your MCP server</li>
              <li><strong>Easier Debugging:</strong> Clear documentation helps troubleshoot issues</li>
              <li><strong>Production Readiness:</strong> Well-documented APIs convert to production-ready MCP servers</li>
            </ul>

            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
            >
              {t('blog.tryConverterNow')}
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default OpenAPIBestPractices;

