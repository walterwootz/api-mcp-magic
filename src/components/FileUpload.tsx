import { useState } from "react";
import { Upload, Link2, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit?: (url: string) => void;
  onTextSubmit?: (content: string) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, onUrlSubmit, onTextSubmit, isLoading }: FileUploadProps) => {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (url.trim() && onUrlSubmit) {
      onUrlSubmit(url.trim());
    }
  };

  const handleTextSubmit = () => {
    if (textContent.trim() && onTextSubmit) {
      onTextSubmit(textContent.trim());
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/30 overflow-hidden">
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-primary/10">
          <TabsTrigger value="file" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Upload className="w-4 h-4 mr-2" />
            {t('fileUpload.uploadFile')}
          </TabsTrigger>
          <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Link2 className="w-4 h-4 mr-2" />
            {t('fileUpload.fromUrl')}
          </TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            {t('fileUpload.pasteContent')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-0">
          <div
            className={cn(
              "border-2 border-dashed border-primary/50 hover:border-primary transition-all duration-300 cursor-pointer",
              "neon-border hover-glow relative overflow-hidden",
              isLoading && "opacity-50 pointer-events-none"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <label className="relative flex flex-col items-center justify-center p-12 cursor-pointer">
              <Upload className="w-16 h-16 text-primary mb-4" />
              <h3 className="text-xl font-display font-bold text-foreground mb-2 text-glow-primary">
                {t('fileUpload.uploadTitle')}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('fileUpload.uploadDescription')}
              </p>
              <input
                type="file"
                className="hidden"
                accept=".json,.yaml,.yml"
                onChange={handleFileInput}
                disabled={isLoading}
              />
              <span className="text-sm text-primary/80">
                {t('fileUpload.supported')}
              </span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="mt-0 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">
                {t('fileUpload.loadFromUrl')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('fileUpload.urlDescription')}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder={t('fileUpload.urlPlaceholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1 border-primary/30 focus:border-primary"
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={isLoading || !url.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                {t('fileUpload.loadButton')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70">
              <strong>{t('fileUpload.urlNote')}</strong> {t('fileUpload.urlNoteText')}<br/>
              {t('fileUpload.urlNoteHelp')}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="text" className="mt-0 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">
                {t('fileUpload.pasteTitle')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('fileUpload.pasteDescription')}
              </p>
            </div>
            <Textarea
              placeholder={t('fileUpload.parsePlaceholder')}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={isLoading}
              className="min-h-[300px] font-mono text-sm border-primary/30 focus:border-primary"
            />
            <Button
              onClick={handleTextSubmit}
              disabled={isLoading || !textContent.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {t('fileUpload.parseButton')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
