import React, { useEffect, useState } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Remove unused imports
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "../layout/AppLayout";
import { db } from "@/lib/db";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

const AnalysisPage = () => {
  const [totalInvestido, setTotalInvestido] = useState(0);
  const [totalRecomendacoes, setTotalRecomendacoes] = useState(0);
  const [perfilDistribuicao, setPerfilDistribuicao] = useState([]);
  const [estrategiaDistribuicao, setEstrategiaDistribuicao] = useState([]);
  const [timeframe, setTimeframe] = useState("all");

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    carregarDados();
  }, [timeframe]);

  const carregarDados = async () => {
    try {
      // Buscar todas as recomendações
      const recomendacoes = await db.recomendacoes.toArray();

      // Filtrar por timeframe se necessário
      const recomendacoesFiltradas = filtrarPorTimeframe(
        recomendacoes,
        timeframe,
      );

      // Calcular valor total investido
      const valorTotal = recomendacoesFiltradas.reduce(
        (total, rec) => total + (rec.valorInvestimento || 0),
        0,
      );

      // Contar total de recomendações
      setTotalRecomendacoes(recomendacoesFiltradas.length);
      setTotalInvestido(valorTotal);

      // Calcular distribuição por perfil de risco
      const perfilCount = {};
      recomendacoesFiltradas.forEach((rec) => {
        const perfil = rec.perfilRisco || "Não definido";
        perfilCount[perfil] = (perfilCount[perfil] || 0) + 1;
      });

      const perfilData = Object.entries(perfilCount).map(([name, value]) => ({
        name,
        value,
      }));
      setPerfilDistribuicao(perfilData);

      // Calcular distribuição por estratégia
      const estrategiaCount = {};
      recomendacoesFiltradas.forEach((rec) => {
        const estrategia = rec.estrategia || "Não definida";
        estrategiaCount[estrategia] = (estrategiaCount[estrategia] || 0) + 1;
      });

      const estrategiaData = Object.entries(estrategiaCount).map(
        ([name, value]) => ({
          name,
          value,
        }),
      );
      setEstrategiaDistribuicao(estrategiaData);
    } catch (error) {
      console.error("Erro ao carregar dados para análise:", error);
    }
  };

  const filtrarPorTimeframe = (recomendacoes, timeframe) => {
    if (timeframe === "all") return recomendacoes;

    const hoje = new Date();
    const dataLimite = new Date();

    switch (timeframe) {
      case "month":
        dataLimite.setMonth(hoje.getMonth() - 1);
        break;
      case "quarter":
        dataLimite.setMonth(hoje.getMonth() - 3);
        break;
      case "year":
        dataLimite.setFullYear(hoje.getFullYear() - 1);
        break;
      default:
        return recomendacoes;
    }

    return recomendacoes.filter((rec) => new Date(rec.data) >= dataLimite);
  };

  // Dados simulados para o gráfico de desempenho
  const performanceData = [
    { name: "Jan", conservador: 2.1, moderado: 3.2, agressivo: 4.5 },
    { name: "Fev", conservador: 2.3, moderado: 3.0, agressivo: -2.1 },
    { name: "Mar", conservador: 1.8, moderado: 2.8, agressivo: 5.2 },
    { name: "Abr", conservador: 2.0, moderado: 3.5, agressivo: 6.1 },
    { name: "Mai", conservador: 1.5, moderado: 2.1, agressivo: -1.8 },
    { name: "Jun", conservador: 1.9, moderado: 3.0, agressivo: 4.2 },
  ];

  // Dados simulados para o gráfico de alocação média
  const alocacaoMediaData = [
    { name: "Ações", value: 35 },
    { name: "Renda Fixa", value: 40 },
    { name: "Alternativos", value: 15 },
    { name: "Caixa", value: 10 },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-white">
              Análise de Portfólio
            </h1>
            <p className="text-muted-foreground dark:text-gray-300">
              Análise detalhada das recomendações de investimento e desempenho.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              Exportar Análise
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">
                Total Investido
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">
                {formatCurrency(totalInvestido)}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Valor total em recomendações
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">
                Recomendações
              </CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">
                {totalRecomendacoes}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Total de recomendações
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">
                Retorno Médio
              </CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">+8.2%</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Nos últimos 12 meses
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">
                Volatilidade
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">12.5%</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Desvio padrão anualizado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Distribuição por Perfil de Risco
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Quantidade de recomendações por perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={
                        perfilDistribuicao.length > 0
                          ? perfilDistribuicao
                          : [
                              { name: "Conservador", value: 1 },
                              { name: "Moderado", value: 1 },
                              { name: "Agressivo", value: 1 },
                            ]
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(perfilDistribuicao.length > 0
                        ? perfilDistribuicao
                        : [
                            { name: "Conservador", value: 1 },
                            { name: "Moderado", value: 1 },
                            { name: "Agressivo", value: 1 },
                          ]
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                Distribuição por Estratégia
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Quantidade de recomendações por estratégia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={
                      estrategiaDistribuicao.length > 0
                        ? estrategiaDistribuicao
                        : [
                            { name: "Portfólio Permanente", value: 1 },
                            { name: "All Weather", value: 1 },
                            { name: "Tradicional 60/40", value: 1 },
                          ]
                    }
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              Desempenho por Perfil de Risco
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Retornos mensais por perfil de risco
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Retorno"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="conservador"
                    stroke="#0088FE"
                    name="Conservador"
                  />
                  <Line
                    type="monotone"
                    dataKey="moderado"
                    stroke="#00C49F"
                    name="Moderado"
                  />
                  <Line
                    type="monotone"
                    dataKey="agressivo"
                    stroke="#FF8042"
                    name="Agressivo"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              Alocação Média de Ativos
            </CardTitle>
            <CardDescription className="dark:text-gray-300">
              Distribuição média entre classes de ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={alocacaoMediaData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {alocacaoMediaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Alocação"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AnalysisPage;
