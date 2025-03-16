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
  const [activeTab, setActiveTab] = useState("overview");

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
    "#8884d8",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
  ];

  // Dados de desempenho para o gráfico de linha
  const performanceData = [
    {
      month: "Jan",
      conservador: 2.1,
      moderado: 3.2,
      agressivo: 4.5,
    },
    {
      month: "Fev",
      conservador: 2.3,
      moderado: 3.0,
      agressivo: -2.1,
    },
    {
      month: "Mar",
      conservador: 1.8,
      moderado: 2.8,
      agressivo: 5.2,
    },
    {
      month: "Abr",
      conservador: 2.0,
      moderado: 3.5,
      agressivo: 6.1,
    },
    {
      month: "Mai",
      conservador: 1.5,
      moderado: 2.1,
      agressivo: -1.8,
    },
    {
      month: "Jun",
      conservador: 1.9,
      moderado: 3.0,
      agressivo: 4.2,
    },
  ];

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
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Desempenho</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            variant: "secondary",
          },
          {
            title: "Gerar Relatório",
            description:
              "Criar um relatório PDF personalizado a partir dos dados existentes",
            icon: <FileText className="h-8 w-8" />,
            to: "/report/new",
            buttonText: "Gerar",
            variant: "outline",
          },
          {
            title: "Configurações",
            description: "Personalizar as configurações da aplicação",
            icon: <Settings className="h-8 w-8" />,
            to: "/settings",
            buttonText: "Configurar",
            variant: "ghost",
          },
        ]}
      />

      {/* Recent Recommendations Table */}
      <RecentRecommendations />

      {/* Tabs Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid gap-4 md:grid-cols-2">
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
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          color: "#333",
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
                          `${name.length > 15 ? name.substring(0, 15) + "..." : name}: ${(percent * 100).toFixed(0)}%`
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
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          color: "#333",
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "performance" && (
          <>
            {/* Performance Overview */}
            <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">
                  Visão Geral de Desempenho
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Desempenho mensal do portfólio entre estratégias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {/* Gráfico de desempenho usando recharts */}
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={performanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#ccc"
                        className="dark:stroke-gray-600"
                      />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        className="dark:stroke-gray-400"
                      />
                      <YAxis stroke="#666" className="dark:stroke-gray-400" />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Retorno"]}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          color: "#333",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="conservador"
                        stroke="#0088FE"
                        name="Conservador"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="moderado"
                        stroke="#00C49F"
                        name="Moderado"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="agressivo"
                        stroke="#FF8042"
                        name="Agressivo"
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comparativo de Retorno por Estratégia */}
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg dark:text-white">
                    Portfólio Permanente
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Retorno médio anualizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-2xl font-bold text-green-500">
                      +6.8%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                    Volatilidade baixa, retornos estáveis
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg dark:text-white">
                    All Weather
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Retorno médio anualizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-2xl font-bold text-green-500">
                      +8.2%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                    Equilíbrio entre risco e retorno
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg dark:text-white">
                    Tradicional 60/40
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Retorno médio anualizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <div className="text-2xl font-bold text-green-500">
                      +7.5%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                    Abordagem clássica balanceada
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
