import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { History, FileDown, BarChart3 } from "lucide-react";
import HistoryFilters from "./HistoryFilters";
import HistoryTable from "./HistoryTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface HistoryManagerProps {
  onViewRecommendation?: (id: string) => void;
  onEditRecommendation?: (id: string) => void;
  onExportRecommendation?: (id: string) => void;
  onDeleteRecommendation?: (id: string) => void;
  onExportHistory?: () => void;
}

const HistoryManager = ({
  onViewRecommendation,
  onEditRecommendation,
  onExportRecommendation,
  onDeleteRecommendation,
  onExportHistory,
}: HistoryManagerProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommendations");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskProfileFilter, setRiskProfileFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);

  const [statistics, setStatistics] = useState({
    totalRecommendations: 0,
    byRiskProfile: {
      conservative: 0,
      moderate: 0,
      aggressive: 0,
    },
    byStatus: {
      draft: 0,
      final: 0,
    },
    byStrategy: {
      permanentPortfolio: 0,
      allWeather: 0,
      custom: 0,
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters();
  };

  const handleFilterChange = (filter: string) => {
    setRiskProfileFilter(filter);
    applyFilters();
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    applyFilters();
  };

  useEffect(() => {
    loadStatistics();
    applyFilters();
  }, []);

  const applyFilters = async () => {
    try {
      let recomendacoes = await db.recomendacoes.toArray();

      // Aplicar filtro de perfil de risco
      if (riskProfileFilter !== "all") {
        const profileMap = {
          conservative: "Conservador",
          moderate: "Moderado",
          aggressive: "Agressivo",
        };
        recomendacoes = recomendacoes.filter(
          (rec) => rec.perfilRisco === profileMap[riskProfileFilter],
        );
      }

      // Aplicar filtro de busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        recomendacoes = recomendacoes.filter(
          (rec) =>
            rec.titulo.toLowerCase().includes(query) ||
            rec.cliente?.toLowerCase().includes(query),
        );
      }

      // Aplicar ordenação
      recomendacoes.sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.data).getTime() - new Date(a.data).getTime();
          case "date-asc":
            return new Date(a.data).getTime() - new Date(b.data).getTime();
          case "name-asc":
            return a.titulo.localeCompare(b.titulo);
          case "name-desc":
            return b.titulo.localeCompare(a.titulo);
          default:
            return 0;
        }
      });

      // Converter para o formato esperado pelo HistoryTable
      const formattedRecommendations = recomendacoes.map((rec) => ({
        id: rec.id?.toString() || "",
        title: rec.titulo,
        createdAt: new Date(rec.data),
        riskProfile: mapRiskProfile(rec.perfilRisco),
        investmentHorizon: rec.horizonteInvestimento,
        strategy: rec.estrategia,
        status: rec.status === "Rascunho" ? "Draft" : "Final",
      }));

      setFilteredRecommendations(formattedRecommendations);
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    }
  };

  const mapRiskProfile = (profile: string) => {
    if (!profile) return "Moderate";
    if (profile === "Conservador") return "Conservative";
    if (profile === "Moderado") return "Moderate";
    return "Aggressive";
  };

  const loadStatistics = async () => {
    try {
      const recomendacoes = await db.recomendacoes.toArray();

      // Contagem total
      const totalRecommendations = recomendacoes.length;

      // Contagem por perfil de risco
      const byRiskProfile = {
        conservative: 0,
        moderate: 0,
        aggressive: 0,
      };

      // Contagem por status
      const byStatus = {
        draft: 0,
        final: 0,
      };

      // Contagem por estratégia
      const byStrategy = {
        permanentPortfolio: 0,
        allWeather: 0,
        custom: 0,
      };

      // Processar cada recomendação
      recomendacoes.forEach((rec) => {
        // Perfil de risco
        if (rec.perfilRisco === "Conservador") byRiskProfile.conservative++;
        else if (rec.perfilRisco === "Moderado") byRiskProfile.moderate++;
        else if (rec.perfilRisco === "Agressivo") byRiskProfile.aggressive++;

        // Status
        if (rec.status === "Rascunho") byStatus.draft++;
        else if (rec.status === "Final") byStatus.final++;

        // Estratégia
        if (rec.estrategia === "Portfólio Permanente")
          byStrategy.permanentPortfolio++;
        else if (rec.estrategia === "Portfólio All Weather")
          byStrategy.allWeather++;
        else byStrategy.custom++;
      });

      setStatistics({
        totalRecommendations,
        byRiskProfile,
        byStatus,
        byStrategy,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  // Determinar o perfil mais usado
  const getMostUsedProfile = () => {
    const { conservative, moderate, aggressive } = statistics.byRiskProfile;
    if (conservative > moderate && conservative > aggressive)
      return "Conservador";
    if (moderate > aggressive) return "Moderado";
    return "Agressivo";
  };

  // Determinar a estratégia mais usada
  const getMostUsedStrategy = () => {
    const { permanentPortfolio, allWeather, custom } = statistics.byStrategy;
    if (permanentPortfolio > allWeather && permanentPortfolio > custom)
      return "Portfólio Permanente";
    if (allWeather > custom) return "All Weather";
    return "Personalizada";
  };

  // Calcular taxa de conclusão
  const getCompletionRate = () => {
    if (statistics.totalRecommendations === 0) return "0%";
    return `${Math.round((statistics.byStatus.final / statistics.totalRecommendations) * 100)}%`;
  };

  // Implementação das funções de callback
  const handleViewRecommendation = (id: string) => {
    try {
      if (onViewRecommendation) {
        onViewRecommendation(id);
      } else {
        // Verificar se a recomendação existe antes de navegar
        db.recomendacoes.get(Number(id)).then((recommendation) => {
          if (recommendation) {
            navigate(`/recommendation/${id}`);
          } else {
            toast({
              variant: "destructive",
              title: "Recomendação não encontrada",
              description: "A recomendação selecionada não foi encontrada.",
            });
          }
        });
      }
    } catch (error) {
      console.error("Erro ao visualizar recomendação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao visualizar",
        description: "Ocorreu um erro ao visualizar a recomendação.",
      });
    }
  };

  const handleEditRecommendation = (id: string) => {
    try {
      if (onEditRecommendation) {
        onEditRecommendation(id);
      } else {
        // Verificar se a recomendação existe antes de navegar
        db.recomendacoes.get(Number(id)).then((recommendation) => {
          if (recommendation) {
            if (recommendation.status === "Rascunho") {
              navigate(`/recommendation/edit/${id}`);
            } else {
              toast({
                variant: "warning",
                title: "Recomendação finalizada",
                description:
                  "Apenas recomendações em rascunho podem ser editadas.",
              });
            }
          } else {
            toast({
              variant: "destructive",
              title: "Recomendação não encontrada",
              description: "A recomendação selecionada não foi encontrada.",
            });
          }
        });
      }
    } catch (error) {
      console.error("Erro ao editar recomendação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao editar",
        description: "Ocorreu um erro ao editar a recomendação.",
      });
    }
  };

  const handleExportRecommendation = async (id: string) => {
    try {
      if (onExportRecommendation) {
        onExportRecommendation(id);
      } else {
        const { exportRecommendationToPDF } = await import("@/lib/pdfExport");
        const recommendation = await db.recomendacoes.get(Number(id));
        if (recommendation) {
          const success = await exportRecommendationToPDF(recommendation);
          if (success) {
            toast({
              title: "Relatório exportado",
              description: "O relatório foi exportado com sucesso.",
            });
          } else {
            throw new Error("Falha ao gerar o PDF");
          }
        } else {
          toast({
            variant: "destructive",
            title: "Recomendação não encontrada",
            description: "A recomendação selecionada não foi encontrada.",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao exportar recomendação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar o relatório.",
      });
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      if (onDeleteRecommendation) {
        onDeleteRecommendation(id);
      } else {
        await db.recomendacoes.delete(Number(id));
        toast({
          title: "Recomendação excluída",
          description: "A recomendação foi excluída com sucesso.",
        });
        loadStatistics();
        applyFilters();
      }
    } catch (error) {
      console.error("Erro ao excluir recomendação:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a recomendação.",
      });
    }
  };

  const handleExportHistory = async () => {
    try {
      if (onExportHistory) {
        onExportHistory();
      } else {
        const { exportHistoryToPDF } = await import("@/lib/pdfExport");
        const recommendations = await db.recomendacoes.toArray();
        exportHistoryToPDF(recommendations);
        toast({
          title: "Histórico exportado",
          description: "O histórico foi exportado com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao exportar o histórico.",
      });
    }
  };

  return (
    <div className="w-full h-full bg-background p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">
            Histórico de Recomendações
          </h1>
          <p className="text-muted-foreground">
            Visualize, filtre e gerencie suas recomendações de investimento
            geradas anteriormente.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportHistory}
            className="dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar Histórico
          </Button>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="recommendations">
            <History className="mr-2 h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <HistoryFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />

          <HistoryTable
            recommendations={filteredRecommendations}
            onView={handleViewRecommendation}
            onEdit={handleEditRecommendation}
            onExport={handleExportRecommendation}
            onDelete={handleDeleteRecommendation}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Profile Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Distribuição por Perfil de Risco
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Detalhamento por perfil de risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Conservador</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byRiskProfile.conservative}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byRiskProfile.conservative / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Moderado</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byRiskProfile.moderate}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byRiskProfile.moderate / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Agressivo</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byRiskProfile.aggressive}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byRiskProfile.aggressive / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Distribuição por Status
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Rascunhos vs. recomendações finais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Rascunho</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byStatus.draft}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-gray-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byStatus.draft / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">Final</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byStatus.final}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byStatus.final / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Distribution */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Distribuição por Estratégia
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Detalhamento por estratégia de alocação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">
                      Portfólio Permanente
                    </span>
                    <span className="font-medium dark:text-white">
                      {statistics.byStrategy.permanentPortfolio}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byStrategy.permanentPortfolio / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">All Weather</span>
                    <span className="font-medium dark:text-white">
                      {statistics.byStrategy.allWeather}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byStrategy.allWeather / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="dark:text-gray-300">
                      Estratégia Personalizada
                    </span>
                    <span className="font-medium dark:text-white">
                      {statistics.byStrategy.custom}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-teal-500 h-2.5 rounded-full"
                      style={{
                        width: `${statistics.totalRecommendations ? (statistics.byStrategy.custom / statistics.totalRecommendations) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Resumo</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Estatísticas gerais de recomendações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                    Total de Recomendações
                  </h3>
                  <p className="text-2xl font-bold dark:text-white">
                    {statistics.totalRecommendations}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                    Perfil Mais Usado
                  </h3>
                  <p className="text-2xl font-bold dark:text-white">
                    {getMostUsedProfile()}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                    Estratégia Mais Usada
                  </h3>
                  <p className="text-2xl font-bold dark:text-white">
                    {getMostUsedStrategy()}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg dark:bg-gray-700/50">
                  <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                    Taxa de Conclusão
                  </h3>
                  <p className="text-2xl font-bold dark:text-white">
                    {getCompletionRate()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryManager;
