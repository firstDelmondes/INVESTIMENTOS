import React from "react";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ReportPreviewProps {
  title?: string;
  description?: string;
  clientName?: string;
  date?: string;
  riskProfile?: string;
  investmentHorizon?: string;
  allocationStrategy?: string;
  assetAllocation?: {
    name: string;
    percentage: number;
    color: string;
  }[];
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
}

const ReportPreview: React.FC<ReportPreviewProps> = ({
  title = "Relatório de Alocação de Portfólio de Investimentos",
  description = "Alocação de investimentos personalizada com base no perfil de risco e horizonte de investimento do cliente",
  clientName = "",
  date = new Date().toLocaleDateString(),
  riskProfile = "",
  investmentHorizon = "",
  allocationStrategy = "",
  assetAllocation = [],

  onDownload = () => console.log("Download report"),
  onPrint = () => console.log("Print report"),
  onShare = () => console.log("Share report"),
}) => {
  return (
    <div className="w-full h-full bg-white p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Prévia do Relatório</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-8 bg-white shadow-sm">
          {/* Report Header */}
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-gray-600 mb-4">{description}</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium">{clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Perfil de Risco</p>
                <p className="font-medium">{riskProfile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Horizonte de Investimento
                </p>
                <p className="font-medium">{investmentHorizon}</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Estratégia de Investimento
            </h2>
            <p className="mb-4">
              Com base no seu perfil de risco e horizonte de investimento,
              recomendamos a estratégia de alocação{" "}
              <strong>{allocationStrategy}</strong>. Esta estratégia foi
              projetada para fornecer retornos equilibrados enquanto gerencia a
              exposição ao risco apropriada para o seu perfil.
            </p>

            <Tabs defaultValue="allocation" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="allocation">Alocação de Ativos</TabsTrigger>
                <TabsTrigger value="details">
                  Detalhes da Estratégia
                </TabsTrigger>
                <TabsTrigger value="performance">
                  Desempenho Esperado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="allocation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Alocação de Ativos</CardTitle>
                    <CardDescription>
                      Distribuição recomendada do portfólio entre classes de
                      ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-6">
                      {/* Placeholder for pie chart - in a real implementation, use a chart library */}
                      <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-100">
                        {assetAllocation.map((asset, index, array) => {
                          // Calculate the cumulative percentage for positioning
                          const previousPercentages = array
                            .slice(0, index)
                            .reduce((sum, a) => sum + a.percentage, 0);
                          const startPercentage = previousPercentages;
                          const endPercentage =
                            startPercentage + asset.percentage;

                          // Convert percentages to degrees for the conic gradient
                          const startDegree = (startPercentage / 100) * 360;
                          const endDegree = (endPercentage / 100) * 360;

                          return (
                            <div
                              key={asset.name}
                              className="absolute inset-0"
                              style={{
                                background: `conic-gradient(${asset.color} ${startDegree}deg, ${asset.color} ${endDegree}deg, transparent ${endDegree}deg)`,
                              }}
                            />
                          );
                        })}
                        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">Portfolio</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assetAllocation.map((asset) => (
                        <div key={asset.name} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: asset.color }}
                          />
                          <span className="flex-1">{asset.name}</span>
                          <span className="font-medium">
                            {asset.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Estratégia</CardTitle>
                    <CardDescription>
                      Informações sobre a estratégia {allocationStrategy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      A estratégia {allocationStrategy} é projetada para ter bom
                      desempenho em várias condições econômicas. Ela equilibra
                      ativos de crescimento com ativos de proteção para criar um
                      portfólio resiliente.
                    </p>
                    <h4 className="font-semibold mt-4 mb-2">
                      Princípios Fundamentais
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Diversificação entre classes de ativos não
                        correlacionadas
                      </li>
                      <li>Proteção contra inflação e deflação</li>
                      <li>
                        Exposição equilibrada ao crescimento econômico e à
                        contração econômica
                      </li>
                      <li>
                        Rebalanceamento regular para manter as alocações alvo
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Desempenho Esperado</CardTitle>
                    <CardDescription>
                      Retornos históricos e projetados para esta alocação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Retorno Anual Esperado
                        </h4>
                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: "65%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-sm">
                          <span>0%</span>
                          <span className="font-medium">6.5%</span>
                          <span>12%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Volatilidade Esperada
                        </h4>
                        <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: "40%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-sm">
                          <span>Baixa</span>
                          <span className="font-medium">Moderada</span>
                          <span>Alta</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">
                          Desempenho Histórico (Simulado)
                        </h4>
                        <div className="h-40 bg-gray-50 rounded border flex items-end p-2">
                          {/* Placeholder for a chart - in a real implementation, use a chart library */}
                          {Array.from({ length: 12 }).map((_, i) => {
                            const height = 30 + Math.random() * 50;
                            return (
                              <div
                                key={i}
                                className="flex-1 mx-1 bg-blue-500 rounded-t"
                                style={{ height: `${height}%` }}
                              />
                            );
                          })}
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                          <span>Jul</span>
                          <span>Aug</span>
                          <span>Sep</span>
                          <span>Oct</span>
                          <span>Nov</span>
                          <span>Dec</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Report Footer */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>
              Este relatório é apenas para fins informativos e não constitui
              aconselhamento de investimento.
            </p>
            <p>
              Gerado pela Ferramenta de Alocação de Portfólio de Investimentos
              em {date}.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onDownload}>Gerar Relatório Final</Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
