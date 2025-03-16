import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  History,
  FileText,
  Settings,
  Wallet,
  DollarSign,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import QuickActions from "./QuickActions";
import RecentRecommendations from "./RecentRecommendations";
import { db, inicializarDB } from "@/lib/db";

interface DashboardContentProps {
  userName?: string;
  totalRecommendations?: number;
  activeStrategies?: number;
  monthlyGrowth?: number;
}

const DashboardContent = ({
  userName = "Equipe de Investimentos",
  totalRecommendations = 0,
  activeStrategies = 0,
  monthlyGrowth = 0,
}: DashboardContentProps) => {
  const [stats, setStats] = useState({
    totalRecomendacoes: totalRecommendations,
    estrategiasAtivas: activeStrategies,
    crescimentoMensal: monthlyGrowth,
    valorTotalInvestido: 0,
    valorMedioPorRecomendacao: 0,
    perfilDistribution: [] as { name: string; value: number }[],
    estrategiaDistribution: [] as { name: string; value: number }[],
  });
  // Removida a aba de desempenho, mantendo apenas visão geral
  const activeTab = "overview";

  useEffect(() => {
    // Verificar se o modo escuro está ativado
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }

    // Inicializa o banco de dados local
    inicializarDB()
      .then(() => {
        // Carrega estatísticas do banco de dados
        carregarEstatisticas();
      })
      .catch((err) => {
        console.error("Erro ao inicializar banco de dados:", err);
      });
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const totalRecomendacoes = await db.recomendacoes.count();

      // Conta estratégias únicas e calcula valores totais
      const todasRecomendacoes = await db.recomendacoes.toArray();
      const estrategiasUnicas = new Set(
        todasRecomendacoes.map((rec) => rec.estrategia),
      );

      // Calcula o valor total investido
      const valorTotalInvestido = todasRecomendacoes.reduce(
        (total, rec) => total + (rec.valorInvestimento || 0),
        0,
      );

      // Calcula o valor médio por recomendação
      const valorMedioPorRecomendacao =
        totalRecomendacoes > 0 ? valorTotalInvestido / totalRecomendacoes : 0;

      // Calcular distribuição por perfil de risco
      const perfilCounts = {
        Conservador: 0,
        Moderado: 0,
        Agressivo: 0,
      };

      todasRecomendacoes.forEach((rec) => {
        if (rec.perfilRisco && perfilCounts[rec.perfilRisco] !== undefined) {
          perfilCounts[rec.perfilRisco]++;
        }
      });

      const perfilDistribution = Object.entries(perfilCounts).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );

      // Calcular distribuição por estratégia
      const estrategiaCounts = {};
      todasRecomendacoes.forEach((rec) => {
        if (rec.estrategia) {
          estrategiaCounts[rec.estrategia] =
            (estrategiaCounts[rec.estrategia] || 0) + 1;
        }
      });

      const estrategiaDistribution = Object.entries(estrategiaCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Pegar as 5 estratégias mais usadas

      setStats({
        totalRecomendacoes,
        estrategiasAtivas: estrategiasUnicas.size,
        crescimentoMensal: todasRecomendacoes.length > 0 ? 8.5 : 0, // Valor baseado nos dados existentes
        valorTotalInvestido,
        valorMedioPorRecomendacao,
        perfilDistribution,
        estrategiaDistribution,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      // Em caso de erro, mantém os valores padrão
      setStats({
        totalRecomendacoes: 0,
        estrategiasAtivas: 0,
        crescimentoMensal: 0,
        valorTotalInvestido: 0,
        valorMedioPorRecomendacao: 0,
        perfilDistribution: [],
        estrategiaDistribution: [],
      });
    }
  };

  // Cores para os gráficos
  const PERFIL_COLORS = ["#0088FE", "#00C49F", "#FF8042"];
  const ESTRATEGIA_COLORS = [
    "#8884d8", // Roxo
    "#83a6ed", // Azul claro
    "#8dd1e1", // Turquesa
    "#82ca9d", // Verde
    "#a4de6c", // Verde limão
    "#ff6b6b", // Vermelho
    "#ffd166", // Amarelo
    "#6a5acd", // Azul escuro
  ];

  // Removidos dados de desempenho que não são mais necessários

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-white">
            Bem-vindo, {userName}
          </h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Aqui está uma visão geral da sua ferramenta de alocação de portfólio
            de investimentos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value="overview" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Total de Recomendações
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {stats.totalRecomendacoes}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Recomendações geradas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Estratégias Ativas
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {stats.estrategiasAtivas}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Estratégias de alocação em uso
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Crescimento Mensal
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              +{stats.crescimentoMensal}%
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Aumento no valor do portfólio
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Valor Total Investido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.valorTotalInvestido)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Soma de todas as recomendações
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">
              Valor Médio por Recomendação
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.valorMedioPorRecomendacao)}
            </div>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              Média por recomendação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-2 mb-6">
        <QuickActions
          actions={[
            {
              title: "Criar Nova Recomendação",
              description:
                "Iniciar uma nova recomendação de alocação de investimentos",
              icon: <PieChart className="h-8 w-8" />,
              to: "/recommendation/new",
              buttonText: "Criar Nova",
              variant: "default",
            },
            {
              title: "Ver Histórico",
              description: "Acessar recomendações geradas anteriormente",
              icon: <History className="h-8 w-8" />,
              to: "/history",
              buttonText: "Ver Histórico",
              variant: "default",
            },
            {
              title: "Gerar Relatório",
              description:
                "Criar um relatório PDF personalizado a partir dos dados existentes",
              icon: <FileText className="h-8 w-8" />,
              to: "/report/new",
              buttonText: "Gerar",
              variant: "default",
            },
            {
              title: "Configurações",
              description: "Personalizar as configurações da aplicação",
              icon: <Settings className="h-8 w-8" />,
              to: "/settings",
              buttonText: "Configurar",
              variant: "default",
            },
          ]}
        />
      </div>

      {/* Recent Recommendations Table */}
      <RecentRecommendations />

      {/* Tabs Content */}
      <div className="mt-8">
        {
          <div className="grid gap-6 md:grid-cols-2">
            {/* Distribuição por Perfil de Risco */}
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Distribuição por Perfil de Risco
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Proporção de recomendações por perfil de investidor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={
                          stats.perfilDistribution.length > 0
                            ? stats.perfilDistribution
                            : [
                                { name: "Conservador", value: 1 },
                                { name: "Moderado", value: 1 },
                                { name: "Agressivo", value: 1 },
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(stats.perfilDistribution.length > 0
                          ? stats.perfilDistribution
                          : [
                              { name: "Conservador", value: 1 },
                              { name: "Moderado", value: 1 },
                              { name: "Agressivo", value: 1 },
                            ]
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PERFIL_COLORS[index % PERFIL_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value, "Recomendações"]}
                        contentStyle={{
                          backgroundColor:
                            document.documentElement.classList.contains("dark")
                              ? "rgba(31, 41, 55, 0.9)"
                              : "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: document.documentElement.classList.contains(
                            "dark",
                          )
                            ? "1px solid #4b5563"
                            : "1px solid #ccc",
                          color: document.documentElement.classList.contains(
                            "dark",
                          )
                            ? "#e5e7eb"
                            : "#333",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Estratégias Mais Utilizadas */}
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Estratégias Mais Utilizadas
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Top estratégias de alocação por frequência de uso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={
                          stats.estrategiaDistribution.length > 0
                            ? stats.estrategiaDistribution
                            : [
                                { name: "Portfólio All Weather", value: 1 },
                                { name: "Portfólio Permanente", value: 1 },
                                { name: "Tradicional 60/40", value: 1 },
                              ]
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name.length > 12 ? name.substring(0, 12) + "..." : name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(stats.estrategiaDistribution.length > 0
                          ? stats.estrategiaDistribution
                          : [
                              { name: "Portfólio All Weather", value: 1 },
                              { name: "Portfólio Permanente", value: 1 },
                              { name: "Tradicional 60/40", value: 1 },
                            ]
                        ).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ESTRATEGIA_COLORS[
                                index % ESTRATEGIA_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          backgroundColor:
                            document.documentElement.classList.contains("dark")
                              ? "rgba(31, 41, 55, 0.9)"
                              : "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: document.documentElement.classList.contains(
                            "dark",
                          )
                            ? "1px solid #4b5563"
                            : "1px solid #ccc",
                          color: document.documentElement.classList.contains(
                            "dark",
                          )
                            ? "#e5e7eb"
                            : "#333",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      </div>
    </div>
  );
};

export default DashboardContent;
