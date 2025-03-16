import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "../ui/use-toast";
import { Upload, Image, Palette, Check } from "lucide-react";

interface BrandingSettingsProps {
  onSave?: (settings: BrandingSettings) => void;
}

interface BrandingSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  reportHeader: string;
  reportFooter: string;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({ onSave }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<BrandingSettings>({
    companyName: "",
    logoUrl: "",
    primaryColor: "#4f46e5",
    secondaryColor: "#10b981",
    accentColor: "#f59e0b",
    reportHeader: "",
    reportFooter: "",
  });

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem("brandingSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        if (parsedSettings.logoUrl) {
          setLogoPreview(parsedSettings.logoUrl);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações de branding:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Converter para base64 para armazenamento local
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setSettings((prev) => ({ ...prev, logoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    setIsSaving(true);
    try {
      // Salvar no localStorage
      localStorage.setItem("brandingSettings", JSON.stringify(settings));
      
      // Aplicar cores ao tema
      document.documentElement.style.setProperty('--primary', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
      document.documentElement.style.setProperty('--accent', settings.accentColor);
      
      // Callback para componente pai
      if (onSave) {
        onSave(settings);
      }
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de branding foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações de branding:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações de branding.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold dark:text-white">Personalização e Branding</h2>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Salvando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start dark:bg-gray-700">
          <TabsTrigger 
            value="general" 
            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
          >
            Geral
          </TabsTrigger>
          <TabsTrigger 
            value="colors" 
            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
          >
            Cores
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
          >
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="dark:text-gray-300">Nome da Empresa</Label>
            <Input
              id="companyName"
              name="companyName"
              value={settings.companyName}
              onChange={handleInputChange}
              placeholder="Nome do seu escritório de investimentos"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="dark:text-gray-300">Logo da Empresa</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden dark:border-gray-600">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <Image className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recomendado: PNG ou SVG com fundo transparente, 200x200px
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="dark:text-gray-300">Cor Primária</Label>
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-md mr-2" 
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={handleInputChange}
                  className="w-16 h-10 p-1 dark:bg-gray-700 dark:border-gray-600"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={handleInputChange}
                  name="primaryColor"
                  className="ml-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor" className="dark:text-gray-300">Cor Secundária</Label>
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-md mr-2" 
                  style={{ backgroundColor: settings.secondaryColor }}
                />
                <Input
                  id="secondaryColor"
                  name="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={handleInputChange}
                  className="w-16 h-10 p-1 dark:bg-gray-700 dark:border-gray-600"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={handleInputChange}
                  name="secondaryColor"
                  className="ml-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor" className="dark:text-gray-300">Cor de Destaque</Label>
              <div className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-md mr-2" 
                  style={{ backgroundColor: settings.accentColor }}
                />
                <Input
                  id="accentColor"
                  name="accentColor"
                  type="color"
                  value={settings.accentColor}
                  onChange={handleInputChange}
                  className="w-16 h-10 p-1 dark:bg-gray-700 dark:border-gray-600"
                />
                <Input
                  value={settings.accentColor}
                  onChange={handleInputChange}
                  name="accentColor"
                  className="ml-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>