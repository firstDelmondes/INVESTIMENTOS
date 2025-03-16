import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/db";
import AppLayout from "../layout/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [companyName, setCompanyName] = useState("AEGIS Capital");
  const [dataPath, setDataPath] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Verificar se o modo escuro está ativado no localStorage ou na preferência do sistema
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setDarkMode(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Simular obtenção do caminho de dados do Electron
  useEffect(() => {
    const getDataPath = async () => {
      try {
        if (window.electron) {
          const path = await window.electron.getUserDataPath();
          setDataPath(path);
        } else {
          setDataPath("/user/data/path (simulado)");
        }
      } catch (error) {
        console.error("Erro ao obter caminho de dados:", error);
        setDataPath("/user/data/path (erro)");
      }
    };

    getDataPath();
  }, []);

  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked.toString());

    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSaveSettings = () => {
    // Salvar configurações no localStorage
    localStorage.setItem("companyName", companyName);
    localStorage.setItem("autoSave", autoSave.toString());
    localStorage.setItem("darkMode", darkMode.toString());

    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    });
  };

  const handleResetDatabase = async () => {
    try {
      // Limpar todas as tabelas do banco de dados
      await db.recomendacoes.clear();

      toast({
        title: "Banco de dados resetado",
        description: "Todos os dados foram removidos com sucesso.",
      });

      setIsResetDialogOpen(false);
    } catch (error) {
      console.error("Erro ao resetar banco de dados:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao resetar o banco de dados.",
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Exportar dados do banco de dados
      const recomendacoes = await db.recomendacoes.toArray();

      // Criar um objeto com todos os dados
      const exportData = {
        recomendacoes,
        settings: {
          companyName,
          autoSave,
          darkMode,
        },
        exportDate: new Date().toISOString(),
      };

      // Converter para JSON e criar um blob
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });

      // Criar um link para download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aegis-capital-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();

      // Limpar
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Dados exportados",
        description: "Seus dados foram exportados com sucesso.",
      });

      setIsExportDialogOpen(false);
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao exportar os dados.",
      });
    }
  };

  const handleImportData = () => {
    // Criar um input de arquivo invisível
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importData = JSON.parse(event.target?.result as string);

            // Verificar se os dados são válidos
            if (!importData.recomendacoes) {
              throw new Error("Formato de arquivo inválido");
            }

            // Importar recomendações
            await db.recomendacoes.clear(); // Limpar dados existentes
            await db.recomendacoes.bulkAdd(importData.recomendacoes);

            // Importar configurações se existirem
            if (importData.settings) {
              if (importData.settings.companyName) {
                setCompanyName(importData.settings.companyName);
                localStorage.setItem(
                  "companyName",
                  importData.settings.companyName,
                );
              }

              if (importData.settings.autoSave !== undefined) {
                setAutoSave(importData.settings.autoSave);
                localStorage.setItem(
                  "autoSave",
                  importData.settings.autoSave.toString(),
                );
              }

              if (importData.settings.darkMode !== undefined) {
                handleDarkModeChange(importData.settings.darkMode);
              }
            }

            toast({
              title: "Dados importados",
              description: `${importData.recomendacoes.length} recomendações foram importadas com sucesso.`,
            });

            setIsImportDialogOpen(false);
          } catch (error) {
            console.error("Erro ao processar arquivo importado:", error);
            toast({
              variant: "destructive",
              title: "Erro",
              description:
                "O arquivo selecionado não é válido ou está corrompido.",
            });
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Ocorreu um erro ao ler o arquivo.",
        });
      }
    };
    fileInput.click();
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-white">
              Configurações
            </h1>
            <p className="text-muted-foreground">
              Gerencie as configurações da sua aplicação de alocação de
              investimentos.
            </p>
          </div>
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Configurações Gerais
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Configure as opções gerais da aplicação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="dark:text-white">
                    Nome da Empresa
                  </Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save" className="dark:text-white">
                      Salvamento Automático
                    </Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Salvar automaticamente as recomendações como rascunho
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Aparência</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Personalize a aparência da aplicação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="dark:text-white">
                      Modo Escuro
                    </Label>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Ativar tema escuro para a aplicação
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={handleDarkModeChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Gerencie os dados da aplicação e opções de backup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="dark:text-white">
                    Localização dos Dados
                  </Label>
                  <div className="p-3 bg-muted dark:bg-gray-700 rounded-md text-sm font-mono break-all dark:text-gray-300">
                    {dataPath}
                  </div>
                </div>

                <Separator className="my-4 dark:bg-gray-700" />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium dark:text-white">
                    Ações de Dados
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      className="dark:text-white dark:border-gray-600"
                      onClick={() => setIsExportDialogOpen(true)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Todos os Dados
                    </Button>
                    <Button
                      variant="outline"
                      className="dark:text-white dark:border-gray-600"
                      onClick={handleImportData}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Importar Dados
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setIsResetDialogOpen(true)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resetar Banco de Dados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de confirmação para resetar banco de dados */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Banco de Dados</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-start space-x-2 text-amber-600">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <span>
                  Esta ação irá remover permanentemente todas as recomendações e
                  dados salvos. Esta ação não pode ser desfeita.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDatabase}
              className="bg-destructive text-destructive-foreground"
            >
              Sim, resetar dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para exportar dados */}
      <AlertDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar Dados</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os seus dados serão exportados em um arquivo JSON que você
              poderá salvar em seu computador. Este arquivo pode ser usado para
              backup ou para transferir dados para outra instalação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExportData}>
              Exportar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default SettingsPage;
