import React, { useState } from "react";
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

interface HistoryManagerProps {
  onViewRecommendation?: (id: string) => void;
  onEditRecommendation?: (id: string) => void;
  onExportRecommendation?: (id: string) => void;
  onDeleteRecommendation?: (id: string) => void;
  onExportHistory?: () => void;
}

const HistoryManager = ({
  onViewRecommendation = () => {},
  onEditRecommendation = () => {},
  onExportRecommendation = () => {},
  onDeleteRecommendation = () => {},
  onExportHistory = () => {},
}: HistoryManagerProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [riskProfileFilter, setRiskProfileFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Dados de estatísticas inicializados com zeros
  const statistics = {
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
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setRiskProfileFilter(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  return (
    <div className="w-full h-full bg-background p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Histórico de Recomendações
          </h1>
          <p className="text-muted-foreground">
            Visualize, filtre e gerencie suas recomendações de investimento
            geradas anteriormente.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onExportHistory}>
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
            onView={onViewRecommendation}
            onEdit={onEditRecommendation}
            onExport={onExportRecommendation}
            onDelete={onDeleteRecommendation}
          />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Profile Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Perfil de Risco</CardTitle>
                <CardDescription>
                  Detalhamento por perfil de risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Conservador</span>
                    <span className="font-medium">
                      {statistics.byRiskProfile.conservative}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byRiskProfile.conservative / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Moderado</span>
                    <span className="font-medium">
                      {statistics.byRiskProfile.moderate}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byRiskProfile.moderate / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Agressivo</span>
                    <span className="font-medium">
                      {statistics.byRiskProfile.aggressive}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-red-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byRiskProfile.aggressive / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Rascunhos vs. recomendações finais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Rascunho</span>
                    <span className="font-medium">
                      {statistics.byStatus.draft}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-gray-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byStatus.draft / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Final</span>
                    <span className="font-medium">
                      {statistics.byStatus.final}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byStatus.final / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Estratégia</CardTitle>
                <CardDescription>
                  Detalhamento por estratégia de alocação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Portfólio Permanente</span>
                    <span className="font-medium">
                      {statistics.byStrategy.permanentPortfolio}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-purple-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byStrategy.permanentPortfolio / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>All Weather</span>
                    <span className="font-medium">
                      {statistics.byStrategy.allWeather}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-indigo-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byStrategy.allWeather / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Estratégia Personalizada</span>
                    <span className="font-medium">
                      {statistics.byStrategy.custom}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-teal-500 h-2.5 rounded-full"
                      style={{
                        width: `${(statistics.byStrategy.custom / statistics.totalRecommendations) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
              <CardDescription>
                Estatísticas gerais de recomendações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total de Recomendações
                  </h3>
                  <p className="text-2xl font-bold">
                    {statistics.totalRecommendations}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Perfil Mais Usado
                  </h3>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Estratégia Mais Usada
                  </h3>
                  <p className="text-2xl font-bold">-</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Taxa de Conclusão
                  </h3>
                  <p className="text-2xl font-bold">0%</p>
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
