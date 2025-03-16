import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "../ui/use-toast";
import { db } from "@/lib/db";
import {
  Download,
  Upload,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Database,
  Settings,
} from "lucide-react";

const BackupManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("backup");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [backupTime, setBackupTime] = useState("23:00");
  const [backupLocation, setBackupLocation] = useState("");
  const [maxBackups, setMaxBackups] = useState("5");

  // Função para criar backup
  const createBackup = async () => {
    setIsBackingUp(true);
    try {
      // Obter todos os dados do banco
      const recomendacoes = await db.recomendacoes.toArray();
      const ativos = await db.ativos.toArray();

      // Verificar se existe a tabela de clientes
      let clientes = [];
      try {
        clientes = await db.table("clientes").toArray();
      } catch (error) {
        console.log("Tabela de clientes não encontrada");
      }

      // Criar objeto de backup
      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        data: {
          recomendacoes,
          ativos,
          clientes,
        },
      };

      // Converter para JSON
      const backupJson = JSON.stringify(backupData, null, 2);

      // Criar blob e link para download
      const blob = new Blob([backupJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `aegis_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Registrar backup no histórico
      const newBackupHistory = [
        ...backupHistory,
        {
          date: new Date(),
          size: (blob.size / 1024).toFixed(2) + " KB",
          items: recomendacoes.length + ativos.length + clientes.length,
          status: "success",
        },
      ];
      setBackupHistory(newBackupHistory);

      toast({
        title: "Backup criado com sucesso",
        description: "O arquivo de backup foi gerado e está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar backup",
        description: "Ocorreu um erro ao gerar o arquivo de backup.",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Função para restaurar backup
  const restoreBackup = async () => {
    if (!backupFile) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description:
          "Por favor, selecione um arquivo de backup para restaurar.",
      });
      return;
    }

    setIsRestoring(true);
    try {
      // Ler arquivo
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target?.result as string);

          // Verificar versão do backup
          if (!backupData.version) {
            throw new Error("Formato de backup inválido");
          }

          // Confirmar restauração
          if (
            !window.confirm(
              "Atenção: Esta operação substituirá todos os dados atuais. Deseja continuar?",
            )
          ) {
            setIsRestoring(false);
            return;
          }

          // Limpar banco de dados atual
          await db.recomendacoes.clear();
          await db.ativos.clear();

          // Verificar se existe a tabela de clientes
          try {
            await db.table("clientes").clear();
          } catch (error) {
            // Se a tabela não existir, criá-la
            if (!db.table("clientes")) {
              await db.version(db.verno + 1).stores({
                clientes: "++id, nome, email, telefone, cpf, dataCadastro",
              });
            }
          }

          // Restaurar dados
          if (backupData.data.recomendacoes?.length > 0) {
            await db.recomendacoes.bulkAdd(backupData.data.recomendacoes);
          }

          if (backupData.data.ativos?.length > 0) {
            await db.ativos.bulkAdd(backupData.data.ativos);
          }

          if (backupData.data.clientes?.length > 0) {
            await db.table("clientes").bulkAdd(backupData.data.clientes);
          }

          toast({
            title: "Backup restaurado com sucesso",
            description: "Todos os dados foram restaurados a partir do backup.",
          });
        } catch (error) {
          console.error("Erro ao processar arquivo de backup:", error);
          toast({
            variant: "destructive",
            title: "Erro ao restaurar backup",
            description:
              "O arquivo de backup parece estar corrompido ou em formato inválido.",
          });
        } finally {
          setIsRestoring(false);
        }
      };

      fileReader.readAsText(backupFile);
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      toast({
        variant: "destructive",
        title: "Erro ao restaurar backup",
        description: "Ocorreu um erro ao processar o arquivo de backup.",
      });
      setIsRestoring(false);
    }
  };

  // Função para salvar configurações de backup automático
  const saveBackupSettings = () => {
    // Aqui seria implementada a lógica para salvar as configurações
    // Como estamos em um ambiente Electron, isso poderia ser feito usando o módulo fs
    // ou alguma biblioteca de persistência de configurações

    localStorage.setItem("autoBackupEnabled", autoBackupEnabled.toString());
    localStorage.setItem("backupFrequency", backupFrequency);
    localStorage.setItem("backupTime", backupTime);
    localStorage.setItem("backupLocation", backupLocation);
    localStorage.setItem("maxBackups", maxBackups);

    toast({
      title: "Configurações salvas",
      description:
        "As configurações de backup automático foram salvas com sucesso.",
    });
  };

  // Função para exportar dados em CSV
  const exportCSV = async (type: string) => {
    try {
      let data = [];
      let filename = "";
      let headers = "";

      if (type === "recomendacoes") {
        data = await db.recomendacoes.toArray();
        filename = "recomendacoes";
        headers =
          "ID,Título,Data,Cliente,Perfil de Risco,Horizonte,Estratégia,Status\n";
      } else if (type === "clientes") {
        try {
          data = await db.table("clientes").toArray();
          filename = "clientes";
          headers = "ID,Nome,Email,Telefone,CPF,Data de Cadastro\n";
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Erro ao exportar clientes",
            description: "A tabela de clientes não foi encontrada.",
          });
          return;
        }
      }

      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "Sem dados para exportar",
          description: `Não há ${type} para exportar.`,
        });
        return;
      }

      let csvContent = headers;

      // Converter dados para CSV
      data.forEach((item) => {
        let row = "";
        if (type === "recomendacoes") {
          row = `${item.id},"${item.titulo}",${new Date(item.data).toLocaleDateString()},"${item.nomeCliente}",${item.perfilRisco},"${item.horizonteInvestimento}","${item.estrategia}",${item.status}\n`;
        } else if (type === "clientes") {
          row = `${item.id},"${item.nome}","${item.email}","${item.telefone}","${item.cpf || ""}",${new Date(item.dataCadastro).toLocaleDateString()}\n`;
        }
        csvContent += row;
      });

      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: `Os dados de ${type} foram exportados com sucesso em formato CSV.`,
      });
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: `Ocorreu um erro ao exportar os dados de ${type}.`,
      });
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 p-6">
      <Card className="w-full h-full overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl dark:text-white">
                Backup e Restauração
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Gerencie backups do sistema e restaure dados quando necessário
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <div className="px-6 border-b dark:border-gray-700">
              <TabsList className="w-full justify-start dark:bg-gray-700">
                <TabsTrigger
                  value="backup"
                  className="flex items-center dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Backup
                </TabsTrigger>
                <TabsTrigger
                  value="restore"
                  className="flex items-center dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Restauração
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="flex items-center dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Exportação
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="backup" className="m-0">
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-4">
                      <div className="flex items-start">
                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                            Backup de Dados
                          </p>
                          <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                            O backup irá salvar todas as recomendações, clientes
                            e configurações do sistema. Recomendamos fazer
                            backups regulares para evitar perda de dados.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        size="lg"
                        onClick={createBackup}
                        disabled={isBackingUp}
                        className="w-64"
                      >
                        {isBackingUp ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Criando Backup...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Criar Backup Agora
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-4 dark:text-white">
                        Histórico de Backups
                      </h3>
                      {backupHistory.length > 0 ? (
                        <div className="border rounded-md dark:border-gray-700">
                          <div className="grid grid-cols-4 gap-4 p-4 border-b dark:border-gray-700 font-medium dark:text-gray-300">
                            <div>Data</div>
                            <div>Tamanho</div>
                            <div>Itens</div>
                            <div>Status</div>
                          </div>
                          {backupHistory.map((backup, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 dark:border-gray-700 dark:text-gray-300"
                            >
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                {backup.date.toLocaleDateString()}
                              </div>
                              <div>{backup.size}</div>
                              <div>{backup.items} itens</div>
                              <div className="flex items-center">
                                {backup.status === "success" ? (
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                )}
                                {backup.status === "success"
                                  ? "Concluído"
                                  : "Falha"}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border rounded-md dark:border-gray-700 dark:text-gray-400">
                          <Database className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                          <p>Nenhum backup realizado ainda</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Clique no botão acima para criar seu primeiro backup
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="restore" className="m-0">
                  <div className="space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                            Atenção: Restauração de Dados
                          </p>
                          <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                            A restauração irá substituir todos os dados atuais
                            pelos dados do backup. Esta operação não pode ser
                            desfeita. Certifique-se de fazer um backup dos dados
                            atuais antes de prosseguir.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label
                        htmlFor="backupFile"
                        className="dark:text-gray-300"
                      >
                        Selecione o arquivo de backup
                      </Label>
                      <Input
                        id="backupFile"
                        type="file"
                        accept=".json"
                        onChange={(e) =>
                          setBackupFile(e.target.files?.[0] || null)
                        }
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Apenas arquivos .json gerados pelo sistema são
                        suportados
                      </p>
                    </div>

                    <div className="flex justify-center mt-6">
                      <Button
                        size="lg"
                        onClick={restoreBackup}
                        disabled={isRestoring || !backupFile}
                        className="w-64"
                      >
                        {isRestoring ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Restaurando...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Restaurar Backup
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="m-0">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base dark:text-white">
                          Backup Automático
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ativar backup automático programado
                        </p>
                      </div>
                      <Switch
                        checked={autoBackupEnabled}
                        onCheckedChange={setAutoBackupEnabled}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="backupFrequency"
                          className="dark:text-gray-300"
                        >
                          Frequência de Backup
                        </Label>
                        <select
                          id="backupFrequency"
                          value={backupFrequency}
                          onChange={(e) => setBackupFrequency(e.target.value)}
                          className="w-full p-2 rounded-md border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          disabled={!autoBackupEnabled}
                        >
                          <option value="daily">Diário</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensal</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="backupTime"
                          className="dark:text-gray-300"
                        >
                          Horário do Backup
                        </Label>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                          <Input
                            id="backupTime"
                            type="time"
                            value={backupTime}
                            onChange={(e) => setBackupTime(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={!autoBackupEnabled}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="backupLocation"
                          className="dark:text-gray-300"
                        >
                          Local de Armazenamento
                        </Label>
                        <div className="flex">
                          <Input
                            id="backupLocation"
                            value={backupLocation}
                            onChange={(e) => setBackupLocation(e.target.value)}
                            placeholder="C:\\Backups\\"
                            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            disabled={!autoBackupEnabled}
                          />
                          <Button
                            variant="outline"
                            className="ml-2 dark:border-gray-600 dark:text-gray-300"
                            disabled={!autoBackupEnabled}
                          >
                            Procurar
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Deixe em branco para usar o local padrão
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="maxBackups"
                          className="dark:text-gray-300"
                        >
                          Número máximo de backups
                        </Label>
                        <Input
                          id="maxBackups"
                          type="number"
                          min="1"
                          max="50"
                          value={maxBackups}
                          onChange={(e) => setMaxBackups(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          disabled={!autoBackupEnabled}
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Backups mais antigos serão excluídos automaticamente
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button onClick={saveBackupSettings}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="export" className="m-0">
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-4">
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                            Exportação de Dados
                          </p>
                          <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                            Exporte seus dados em formatos compatíveis com Excel
                            e outros softwares. Útil para análises externas ou
                            integração com outros sistemas.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg dark:text-white">
                            Recomendações
                          </CardTitle>
                          <CardDescription className="dark:text-gray-300">
                            Exporte todas as recomendações de investimento
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Inclui dados como perfil de risco, horizonte de
                            investimento, estratégia e alocação de ativos.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                            onClick={() => exportCSV("recomendacoes")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Exportar como CSV
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-lg dark:text-white">
                            Clientes
                          </CardTitle>
                          <CardDescription className="dark:text-gray-300">
                            Exporte todos os dados de clientes
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Inclui informações como nome, email, telefone e data
                            de cadastro.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            className="w-full dark:border-gray-600 dark:text-gray-300"
                            onClick={() => exportCSV("clientes")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Exportar como CSV
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>

                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        className="dark:border-gray-600 dark:text-gray-300"
                        onClick={() => {
                          toast({
                            title: "Recurso em desenvolvimento",
                            description:
                              "A exportação em outros formatos estará disponível em breve.",
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Mais Opções de Exportação
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t p-4 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Última atividade:{" "}
            {backupHistory.length > 0
              ? `Backup realizado em ${backupHistory[backupHistory.length - 1].date.toLocaleString()}`
              : "Nenhuma atividade registrada"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BackupManager;
