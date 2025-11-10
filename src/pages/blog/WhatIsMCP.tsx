import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WhatIsMCP = () => {
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
            {t('blog.whatIsMcp.title')}
          </h1>
          
          <div className="text-muted-foreground space-y-6">
            <p className="text-lg leading-relaxed">
              {t('blog.whatIsMcp.intro')}
            </p>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.whatIsMcp.whyMattersTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.whatIsMcp.whyMattersPara1')}
            </p>

            <p className="leading-relaxed">
              {t('blog.whatIsMcp.whyMattersPara2')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('blog.whatIsMcp.universalProtocol')}</strong> {t('blog.whatIsMcp.universalProtocolDesc')}</li>
              <li><strong>{t('blog.whatIsMcp.easyIntegration')}</strong> {t('blog.whatIsMcp.easyIntegrationDesc')}</li>
              <li><strong>{t('blog.whatIsMcp.productionReady')}</strong> {t('blog.whatIsMcp.productionReadyDesc')}</li>
              <li><strong>{t('blog.whatIsMcp.openSource')}</strong> {t('blog.whatIsMcp.openSourceDesc')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.whatIsMcp.howWorksTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.whatIsMcp.howWorksPara')}
            </p>

            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>{t('blog.whatIsMcp.mcpServers')}</strong> {t('blog.whatIsMcp.mcpServersDesc')}</li>
              <li><strong>{t('blog.whatIsMcp.mcpClients')}</strong> {t('blog.whatIsMcp.mcpClientsDesc')}</li>
              <li><strong>{t('blog.whatIsMcp.toolsResources')}</strong> {t('blog.whatIsMcp.toolsResourcesDesc')}</li>
            </ol>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.whatIsMcp.convertingTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.whatIsMcp.convertingPara')}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>{t('blog.whatIsMcp.convertingBenefit1')}</li>
              <li>{t('blog.whatIsMcp.convertingBenefit2')}</li>
              <li>{t('blog.whatIsMcp.convertingBenefit3')}</li>
              <li>{t('blog.whatIsMcp.convertingBenefit4')}</li>
            </ul>

            <h2 className="text-2xl font-display font-bold text-foreground mt-8 mb-4">
              {t('blog.whatIsMcp.gettingStartedTitle')}
            </h2>
            
            <p className="leading-relaxed">
              {t('blog.whatIsMcp.gettingStartedPara')}
            </p>

            <ol className="list-decimal pl-6 space-y-2 mb-8">
              <li>{t('blog.whatIsMcp.step1')}</li>
              <li>{t('blog.whatIsMcp.step2')}</li>
              <li>{t('blog.whatIsMcp.step3')}</li>
              <li>{t('blog.whatIsMcp.step4')}</li>
            </ol>

            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white"
            >
              {t('blog.tryConverterNow')}
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default WhatIsMCP;
