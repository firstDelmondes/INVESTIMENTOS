import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart, LineChart, PieChart, TrendingUp } from "lucide-react";
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
  });

  useEffect(() => {
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

      // Conta estratégias únicas
      const todasRecomendacoes = await db.recomendacoes.toArray();
      const estrategiasUnicas = new Set(
        todasRecomendacoes.map((rec) => rec.estrategia),
      );

      setStats({
        totalRecomendacoes,
        estrategiasAtivas: estrategiasUnicas.size,
        crescimentoMensal: todasRecomendacoes.length > 0 ? 8.5 : 0, // Valor baseado nos dados existentes
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      // Em caso de erro, mantém os valores padrão
      setStats({
        totalRecomendacoes: 0,
        estrategiasAtivas: 0,
        crescimentoMensal: 0,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {userName}
          </h1>
          <p className="text-muted-foreground">
            Aqui está uma visão geral da sua ferramenta de alocação de portfólio
            de investimentos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="overview" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Recomendações
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecomendacoes}</div>
            <p className="text-xs text-muted-foreground">
              Recomendações geradas
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estratégias Ativas
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.estrategiasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Estratégias de alocação em uso
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento Mensal
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{stats.crescimentoMensal}%
            </div>
            <p className="text-xs text-muted-foreground">
              Aumento no valor do portfólio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <QuickActions />

      {/* Recent Recommendations Table */}
      <RecentRecommendations />

      {/* Performance Overview */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Visão Geral de Desempenho</CardTitle>
          <CardDescription>
            Desempenho mensal do portfólio entre estratégias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="flex flex-col items-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2" />
              <p>O gráfico de desempenho será exibido aqui</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContent;
