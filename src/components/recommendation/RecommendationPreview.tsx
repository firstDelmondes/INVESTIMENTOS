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
import { PieChart, BarChart, ArrowRight, Download, Edit } from "lucide-react";

interface AssetAllocation {
  name: string;
  percentage: number;
  color: string;
}

interface RecommendationPreviewProps {
  title?: string;
  description?: string;
  riskProfile?: "Conservative" | "Moderate" | "Aggressive";
  investmentHorizon?: string;
  strategy?: string;
  allocations?: AssetAllocation[];
  onEdit?: () => void;
  onContinue?: () => void;
}

const RecommendationPreview = ({
  title = "Recomendação de Alocação de Investimentos",
  description = "Com base no seu perfil de risco e horizonte de investimento selecionados, aqui está a alocação de ativos recomendada.",
  riskProfile = "",
  investmentHorizon = "",
  strategy = "",
  allocations = [],

  onEdit = () => {},
  onContinue = () => {},
}: RecommendationPreviewProps) => {
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
              <h3 className="text-sm font-medium text-slate-500">Estratégia</h3>
              <p className="text-lg font-semibold mt-1">{strategy}</p>
            </div>
          </div>

          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chart">
                <PieChart className="mr-2 h-4 w-4" />
                Gráfico de Pizza
              </TabsTrigger>
              <TabsTrigger value="table">
                <BarChart className="mr-2 h-4 w-4" />
                Visualização em Tabela
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="mt-6">
              <div className="flex justify-center items-center h-64">
                {/* Placeholder for pie chart - in a real implementation, use a chart library */}
                <div className="relative w-48 h-48 rounded-full overflow-hidden flex items-center justify-center">
                  {allocations.map((asset, index, array) => {
                    // Calculate the cumulative percentage for positioning
                    const previousPercentages = array
                      .slice(0, index)
                      .reduce((sum, a) => sum + a.percentage, 0);
                    const startAngle = (previousPercentages / 100) * 360;
                    const endAngle =
                      ((previousPercentages + asset.percentage) / 100) * 360;

                    return (
                      <div
                        key={asset.name}
                        className="absolute inset-0"
                        style={{
                          background: asset.color,
                          clipPath: `conic-gradient(from ${startAngle}deg, ${asset.color} ${asset.percentage}%, transparent ${asset.percentage}%)`,
                        }}
                      />
                    );
                  })}
                  <div className="bg-white w-24 h-24 rounded-full z-10 flex items-center justify-center">
                    <span className="text-sm font-medium">Allocation</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {allocations.map((asset) => (
                  <div key={asset.name} className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: asset.color }}
                    />
                    <span className="text-sm font-medium">{asset.name}</span>
                    <span className="ml-auto font-semibold">
                      {asset.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table">
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
                        key={asset.name}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="py-3 px-4 flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: asset.color }}
                          />
                          {asset.name}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {asset.percentage}%
                        </td>
                        <td className="text-right py-3 px-4 text-slate-500">
                          {Math.max(0, asset.percentage - 5)}% -{" "}
                          {Math.min(100, asset.percentage + 5)}%
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
