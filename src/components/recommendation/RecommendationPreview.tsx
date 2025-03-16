import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ArrowRight,
  Download,
  Edit,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AssetAllocation {
  nome: string;
  percentual: number;
  cor: string;
}

interface RecommendationPreviewProps {
  clientName: string;
  clientAge?: number;
  investmentObjective?: string;
  investmentValue: number;
  title?: string;
  description?: string;
  riskProfile?: string;
  investmentHorizon?: string;
  strategy?: string;
  allocations?: AssetAllocation[];
  onEdit?: () => void;
  onContinue?: () => void;
}

const RecommendationPreview = ({
  clientName,
  clientAge,
  investmentObjective,
  investmentValue,
  title = "Recomendação de Alocação de Investimentos",
  description = "Com base no seu perfil de risco e horizonte de investimento selecionados, aqui está a alocação de ativos recomendada.",
  riskProfile = "",
  investmentHorizon = "",
  strategy = "",
  allocations = [],
  onEdit = () => {},
  onContinue = () => {},
}: RecommendationPreviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="w-full p-6 bg-white">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Parâmetros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">Cliente</h3>
              <p className="text-lg font-semibold mt-1">
                {clientName || "Cliente não informado"}
                {clientAge ? ` (${clientAge} anos)` : ""}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">
                Valor do Investimento
              </h3>
              <p className="text-lg font-semibold mt-1">
                {formatCurrency(investmentValue)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">
                Perfil de Risco
              </h3>
              <p className="text-lg font-semibold mt-1">{riskProfile}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">
                Horizonte de Investimento
              </h3>
              <p className="text-lg font-semibold mt-1">{investmentHorizon}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">Objetivo</h3>
              <p className="text-lg font-semibold mt-1">
                {investmentObjective === "retirement"
                  ? "Aposentadoria"
                  : investmentObjective === "reserve"
                    ? "Reserva de Emergência"
                    : investmentObjective === "education"
                      ? "Educação"
                      : investmentObjective === "property"
                        ? "Compra de Imóvel"
                        : investmentObjective === "wealth"
                          ? "Crescimento de Patrimônio"
                          : investmentObjective === "income"
                            ? "Geração de Renda"
                            : investmentObjective === "travel"
                              ? "Viagens"
                              : "Outro Objetivo"}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-slate-500">Estratégia</h3>
              <p className="text-lg font-semibold mt-1">{strategy}</p>
            </div>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chart">
                <PieChartIcon className="mr-2 h-4 w-4" />
                Gráfico de Pizza
              </TabsTrigger>
              <TabsTrigger value="table">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Visualização em Tabela
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="mt-6">
              <div className="flex justify-center items-center h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentual"
                      nameKey="nome"
                      label={({ nome, percentual }) =>
                        `${nome}: ${percentual}%`
                      }
                    >
                      {allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.cor} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {allocations.map((asset) => (
                  <div key={asset.nome} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: asset.cor }}
                    />
                    <span className="text-sm font-medium">{asset.nome}</span>
                    <span className="ml-auto font-semibold">
                      {asset.percentual}%
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Classe de Ativo</th>
                      <th className="text-right py-3 px-4">Alocação</th>
                      <th className="text-right py-3 px-4">Faixa Alvo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocations.map((asset) => (
                      <tr
                        key={asset.nome}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: asset.cor }}
                          />
                          {asset.nome}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {asset.percentual}%
                        </td>
                        <td className="text-right py-3 px-4 text-slate-500">
                          {Math.max(0, asset.percentual - 5)}% -{" "}
                          {Math.min(100, asset.percentual + 5)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button onClick={onContinue}>
            Continuar para Relatório
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RecommendationPreview;
