import React, { useState, useEffect } from "react";
import {
  FileText,
  Save,
  ArrowRight,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import ReportCustomization from "./ReportCustomization";
import ReportPreview from "./ReportPreview";
import { db } from "@/lib/db";

interface ReportGeneratorProps {
  recommendationData?: {
    riskProfile?: string;
    investmentHorizon?: string;
    allocationStrategy?: string;
    assetAllocation?: {
      name: string;
      percentage: number;
      color: string;
    }[];
  };
  onSave?: (reportData: any) => void;
  onCancel?: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  recommendationData = {
    riskProfile: "",
    investmentHorizon: "",
    allocationStrategy: "",
    assetAllocation: [],
  },

  onSave = () => {},
  onCancel = () => {},
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("customize");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    number | null
  >(null);
  const [reportData, setReportData] = useState({
    title: "Relatório de Alocação de Portfólio de Investimentos",
    description:
      "Alocação de investimentos personalizada com base no perfil de risco e horizonte de investimento do cliente",
    clientName: "",
    includeExecutiveSummary: true,
    includeMarketAnalysis: true,
    includeAssetAllocation: true,
    includePerformanceProjections: true,
    includeRiskAnalysis: true,
    includeRecommendations: true,
    reportFormat: "detailed",
    additionalNotes: "",
    ...recommendationData,
  });

  // Carregar recomendações do banco de dados
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const recomendacoes = await db.recomendacoes.toArray();
        setRecommendations(recomendacoes);
      } catch (error) {
        console.error("Erro ao carregar recomendações:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar recomendações",
          description:
            "Não foi possível carregar as recomendações do banco de dados.",
        });
      }
    };

    loadRecommendations();
  }, [toast]);

  // Atualizar dados do relatório quando uma recomendação for selecionada
  useEffect(() => {
    if (selectedRecommendationId) {
      const loadRecommendationData = async () => {
        try {
          const recomendacao = await db.recomendacoes.get(
            selectedRecommendationId,
          );
          if (recomendacao) {
            setReportData({
              ...reportData,
              title: `Relatório de Investimentos - ${recomendacao.nomeCliente}`,
              description: `Alocação de investimentos personalizada para ${recomendacao.nomeCliente} com base no perfil de risco ${recomendacao.perfilRisco} e horizonte de investimento ${recomendacao.horizonteInvestimento}`,
              clientName: recomendacao.nomeCliente,
              riskProfile: recomendacao.perfilRisco,
              investmentHorizon: recomendacao.horizonteInvestimento,
              allocationStrategy: recomendacao.estrategia,
              assetAllocation: recomendacao.alocacaoAtivos.map((asset) => ({
                name: asset.nome,
                percentage: asset.percentual,
                color: asset.cor,
              })),
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados da recomendação:", error);
        }
      };

      loadRecommendationData();
    }
  }, [selectedRecommendationId]);

  const handleCustomizationSubmit = (values: any) => {
    setReportData({ ...reportData, ...values });
    setActiveTab("preview");
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Importar a função de exportação de PDF dinamicamente
      const { exportRecommendationToPDF } = await import("@/lib/pdfExport");

      // Verificar se os dados necessários estão presentes
      if (!reportData.clientName) {
        toast({
          variant: "destructive",
          title: "Dados incompletos",
          description:
            "Por favor, informe o nome do cliente para gerar o relatório.",
        });
        setActiveTab("customize");
        setIsGenerating(false);
        return;
      }

      // Preparar dados para o relatório
      const reportDataForPDF = {
        titulo: reportData.title,
        data: new Date(),
        nomeCliente: reportData.clientName,
        idadeCliente: selectedRecommendationId
          ? await getClientAge(selectedRecommendationId)
          : 35,
        objetivoInvestimento: selectedRecommendationId
          ? await getInvestmentObjective(selectedRecommendationId)
          : "wealth",
        valorInvestimento: selectedRecommendationId
          ? await getInvestmentValue(selectedRecommendationId)
          : 100000,
        perfilRisco: reportData.riskProfile || "Moderado",
        horizonteInvestimento:
          reportData.investmentHorizon || "5 anos (Médio Prazo)",
        estrategia: reportData.allocationStrategy || "Alocação Personalizada",
        alocacaoAtivos:
          reportData.assetAllocation && reportData.assetAllocation.length > 0
            ? reportData.assetAllocation.map((asset) => ({
                nome: asset.name,
                percentual: asset.percentage,
                cor: asset.color,
              }))
            : [
                { nome: "Ações", percentual: 40, cor: "#4f46e5" },
                { nome: "Renda Fixa", percentual: 40, cor: "#10b981" },
                { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
                { nome: "Caixa", percentual: 5, cor: "#6b7280" },
              ],
        status: "Final",
        includeExecutiveSummary: reportData.includeExecutiveSummary,
        includeMarketAnalysis: reportData.includeMarketAnalysis,
        includeAssetAllocation: reportData.includeAssetAllocation,
        includePerformanceProjections: reportData.includePerformanceProjections,
        includeRiskAnalysis: reportData.includeRiskAnalysis,
        includeRecommendations: reportData.includeRecommendations,
        reportFormat: reportData.reportFormat,
        additionalNotes: reportData.additionalNotes,
      };

      try {
        // Primeiro salvar relatório no banco de dados
        const reportId = await db.recomendacoes.add(reportDataForPDF);

        // Depois tentar gerar o PDF
        const success = await exportRecommendationToPDF(reportDataForPDF);

        if (!success) {
          // Mesmo se falhar o PDF, o relatório já foi salvo
          toast({
            variant: "warning",
            title: "Relatório salvo, mas PDF não gerado",
            description:
              "O relatório foi salvo no histórico, mas houve um problema ao gerar o arquivo PDF. Verifique as permissões do sistema.",
          });
        } else {
          toast({
            title: "Relatório gerado com sucesso",
            description:
              "O relatório foi salvo e está disponível no histórico.",
          });
        }

        onSave(reportData);

        // Redirecionar para o histórico após salvar
        navigate("/history");
      } catch (pdfError) {
        console.error("Erro específico ao gerar PDF:", pdfError);
        toast({
          variant: "destructive",
          title: "Erro ao gerar PDF",
          description: `Falha ao gerar o arquivo PDF: ${pdfError.message}. Verifique se você tem permissões para salvar arquivos.`,
        });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Funções auxiliares para obter dados da recomendação selecionada
  const getClientAge = async (id: number) => {
    try {
      const recommendation = await db.recomendacoes.get(id);
      return recommendation?.idadeCliente || 35;
    } catch (error) {
      console.error("Erro ao obter idade do cliente:", error);
      return 35;
    }
  };

  const getInvestmentObjective = async (id: number) => {
    try {
      const recommendation = await db.recomendacoes.get(id);
      return recommendation?.objetivoInvestimento || "wealth";
    } catch (error) {
      console.error("Erro ao obter objetivo de investimento:", error);
      return "wealth";
    }
  };

  const getInvestmentValue = async (id: number) => {
    try {
      const recommendation = await db.recomendacoes.get(id);
      return recommendation?.valorInvestimento || 100000;
    } catch (error) {
      console.error("Erro ao obter valor de investimento:", error);
      return 100000;
    }
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6 dark:bg-gray-900">
      <Card className="w-full h-full overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl dark:text-white">
                Gerador de Relatórios
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Personalize e gere relatórios de recomendação de investimentos
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="dark:text-gray-300 dark:border-gray-600"
              >
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {recommendations.length === 0 && (
          <div className="mx-6 mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2" />
              <div>
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                  Nenhuma recomendação encontrada
                </p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                  Crie uma recomendação primeiro para gerar um relatório
                  completo com dados personalizados.
                </p>
              </div>
            </div>
          </div>
        )}

        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <div className="px-6 border-b dark:border-gray-700">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="customize" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Personalizar Relatório
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Prévia do Relatório
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="customize" className="h-full m-0 p-0">
                <ReportCustomization
                  initialData={reportData}
                  onSubmit={handleCustomizationSubmit}
                  recommendations={recommendations}
                  onRecommendationSelect={setSelectedRecommendationId}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0 p-0">
                <ReportPreview
                  title={reportData.title}
                  description={reportData.description}
                  clientName={reportData.clientName}
                  riskProfile={reportData.riskProfile}
                  investmentHorizon={reportData.investmentHorizon}
                  allocationStrategy={reportData.allocationStrategy}
                  assetAllocation={reportData.assetAllocation}
                  onDownload={handleGenerateReport}
                  onPrint={() => window.print()}
                  onShare={() => {
                    toast({
                      title: "Compartilhamento",
                      description:
                        "Função de compartilhamento será implementada em breve.",
                    });
                  }}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t p-4 dark:border-gray-700">
          <div className="flex justify-between w-full items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/history")}
              className="dark:text-gray-300 dark:border-gray-600"
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Histórico de Relatórios
            </Button>

            <Button
              variant="outline"
              onClick={handleGenerateReport}
              className="dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar como PDF
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ReportGenerator;
