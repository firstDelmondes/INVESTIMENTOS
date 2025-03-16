import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

// Função para obter a descrição da estratégia
const getStrategyDescription = (strategy: string = ""): string => {
  const descriptions: Record<string, string> = {
    "Portfólio Permanente":
      "O Portfólio Permanente é uma estratégia de investimento que busca manter o valor do capital em diferentes cenários econômicos. Ele divide os investimentos igualmente entre quatro classes de ativos: ações, títulos de longo prazo, ouro e caixa, cada um representando 25% da carteira.",
    "Portfólio All Weather":
      "O Portfólio All Weather é uma estratégia desenvolvida para ter bom desempenho em qualquer ambiente econômico. Ele equilibra exposições a crescimento, inflação, deflação e recessão, distribuindo os investimentos entre ações, títulos de longo e médio prazo, commodities e caixa.",
    "Tradicional 60/40":
      "A estratégia Tradicional 60/40 aloca 60% dos investimentos em ações e 40% em títulos de renda fixa. É uma abordagem clássica que busca equilibrar crescimento e estabilidade, sendo amplamente utilizada por investidores de longo prazo.",
    "Otimização de Markowitz":
      "Baseada na Teoria Moderna do Portfólio, a Otimização de Markowitz busca maximizar o retorno esperado para um determinado nível de risco. Utiliza correlações entre ativos para criar uma carteira eficiente na fronteira de possibilidades de investimento.",
    "Paridade de Risco":
      "A estratégia de Paridade de Risco aloca os investimentos de forma que cada classe de ativos contribua igualmente para o risco total do portfólio. Isso geralmente resulta em maior diversificação e menor concentração em ativos mais voláteis como ações.",
    "Black-Litterman":
      "O modelo Black-Litterman combina as visões do investidor sobre o mercado com o equilíbrio de mercado para criar alocações personalizadas. É uma abordagem sofisticada que permite incorporar expectativas específicas sobre classes de ativos.",
    "Pesos Iguais":
      "A estratégia de Pesos Iguais distribui o capital uniformemente entre todas as classes de ativos disponíveis. É uma abordagem simples que evita a concentração excessiva e pode oferecer benefícios de diversificação.",
    "Momentum e Rotação":
      "Esta estratégia investe em ativos que demonstraram forte desempenho recente (momentum) e realiza rotações periódicas entre classes de ativos com base em seu desempenho relativo. Busca capturar tendências de mercado de curto a médio prazo.",
    "Variância Mínima":
      "A estratégia de Variância Mínima busca criar um portfólio com a menor volatilidade possível, independentemente do retorno esperado. Foca em ativos de baixa volatilidade e correlações negativas para minimizar as oscilações do portfólio.",
    "Alocação Personalizada":
      "Esta estratégia foi personalizada especificamente para seu perfil de risco, horizonte de investimento e objetivos financeiros. Combina elementos de diversas abordagens para criar uma alocação sob medida para suas necessidades.",
  };

  // Verificar se a estratégia existe no mapa, caso contrário retornar uma descrição genérica
  if (!strategy || !descriptions[strategy]) {
    return "Esta estratégia é personalizada com base no seu perfil de risco e horizonte de investimento. Ela combina elementos de diversas abordagens para criar uma alocação que atenda às suas necessidades específicas.";
  }

  return descriptions[strategy];
};

// Função para obter os princípios da estratégia
const getStrategyPrinciples = (strategy: string = ""): string[] => {
  const commonPrinciples = [
    "Diversificação entre classes de ativos não correlacionadas",
    "Rebalanceamento regular para manter as alocações alvo",
  ];

  const strategyPrinciples: Record<string, string[]> = {
    "Portfólio Permanente": [
      "Divisão igualitária entre ações, títulos de longo prazo, ouro e caixa",
      "Proteção contra diferentes cenários econômicos",
      "Baixa frequência de rebalanceamento (anual)",
      "Foco na preservação de capital",
    ],
    "Portfólio All Weather": [
      "Equilíbrio entre ativos de crescimento e proteção",
      "Proteção contra inflação e deflação",
      "Exposição balanceada a diferentes ambientes econômicos",
      "Diversificação por fatores de risco, não apenas por classes de ativos",
    ],
    "Tradicional 60/40": [
      "Alocação de 60% em ações para crescimento",
      "Alocação de 40% em títulos para estabilidade",
      "Simplicidade e facilidade de implementação",
      "Histórico comprovado de desempenho de longo prazo",
    ],
    "Otimização de Markowitz": [
      "Maximização do retorno para um determinado nível de risco",
      "Utilização de correlações entre ativos",
      "Construção de portfólios na fronteira eficiente",
      "Abordagem matemática e quantitativa",
    ],
    "Paridade de Risco": [
      "Contribuição igual de risco de cada classe de ativo",
      "Menor concentração em ativos voláteis",
      "Maior diversificação efetiva",
      "Potencial para menor drawdown em crises",
    ],
    "Black-Litterman": [
      "Combinação de visões do investidor com equilíbrio de mercado",
      "Incorporação de expectativas específicas sobre classes de ativos",
      "Abordagem bayesiana para estimativas de retorno",
      "Redução de erros de estimativa",
    ],
    "Pesos Iguais": [
      "Distribuição uniforme do capital entre classes de ativos",
      "Evita concentração excessiva",
      "Simplicidade e transparência",
      "Redução do risco de timing de mercado",
    ],
    "Momentum e Rotação": [
      "Foco em ativos com forte desempenho recente",
      "Rotações periódicas entre classes de ativos",
      "Captura de tendências de mercado",
      "Abordagem tática e dinâmica",
    ],
    "Variância Mínima": [
      "Foco na minimização da volatilidade total",
      "Utilização de ativos de baixa volatilidade",
      "Exploração de correlações negativas",
      "Priorização da estabilidade sobre retornos máximos",
    ],
    "Alocação Personalizada": [
      "Adaptação às necessidades específicas do investidor",
      "Consideração do perfil de risco individual",
      "Alinhamento com objetivos financeiros específicos",
      "Flexibilidade para ajustes conforme mudanças nas circunstâncias",
    ],
  };

  // Verificar se a estratégia existe no mapa, caso contrário retornar princípios comuns
  if (!strategy || !strategyPrinciples[strategy]) {
    return [
      ...commonPrinciples,
      "Proteção contra inflação e deflação",
      "Exposição equilibrada ao crescimento econômico e à contração econômica",
    ];
  }

  return [...commonPrinciples, ...strategyPrinciples[strategy]];
};

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
  onPrint = () => window.print(),
  onShare = () => console.log("Share report"),
}) => {
  // Adicionar estilos de impressão quando o componente for montado
  React.useEffect(() => {
    const style = document.createElement("style");
    style.id = "print-styles";
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById("print-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto print-section">
        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-2xl font-bold dark:text-white">
            Prévia do Relatório
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
              className="dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-8 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          {/* Report Header */}
          <div className="mb-8 border-b pb-6 dark:border-gray-700">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">{title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {description}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Cliente
                </p>
                <p className="font-medium dark:text-white">{clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
                <p className="font-medium dark:text-white">{date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Perfil de Risco
                </p>
                <p className="font-medium dark:text-white">{riskProfile}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Horizonte de Investimento
                </p>
                <p className="font-medium dark:text-white">
                  {investmentHorizon}
                </p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Estratégia de Investimento
            </h2>
            <p className="mb-4 dark:text-gray-300">
              Com base no seu perfil de risco e horizonte de investimento,
              recomendamos a estratégia de alocação{" "}
              <strong className="dark:text-white">{allocationStrategy}</strong>.
              Esta estratégia foi projetada para fornecer retornos equilibrados
              enquanto gerencia a exposição ao risco apropriada para o seu
              perfil.
            </p>

            <Tabs defaultValue="allocation" className="mt-6">
              <TabsList className="mb-4 dark:bg-gray-700">
                <TabsTrigger
                  value="allocation"
                  className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white dark:text-gray-300"
                >
                  Alocação de Ativos
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white dark:text-gray-300"
                >
                  Detalhes da Estratégia
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white dark:text-gray-300"
                >
                  Desempenho Esperado
                </TabsTrigger>
              </TabsList>

              <TabsContent value="allocation" className="space-y-4">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">
                      Alocação de Ativos
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Distribuição recomendada do portfólio entre classes de
                      ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-6">
                      {/* Placeholder for pie chart - in a real implementation, use a chart library */}
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetAllocation}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                            nameKey="name"
                          >
                            {assetAllocation.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color || COLORS[index % COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Alocação"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assetAllocation.map((asset) => (
                        <div key={asset.name} className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: asset.color }}
                          />
                          <span className="flex-1 dark:text-gray-300">
                            {asset.name}
                          </span>
                          <span className="font-medium dark:text-white">
                            {asset.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">
                      Detalhes da Estratégia
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Informações sobre a estratégia {allocationStrategy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 dark:text-gray-300">
                      {getStrategyDescription(allocationStrategy)}
                    </p>
                    <h4 className="font-semibold mt-4 mb-2 dark:text-white">
                      Princípios Fundamentais
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 dark:text-gray-300">
                      {getStrategyPrinciples(allocationStrategy).map(
                        (principle, index) => (
                          <li key={index}>{principle}</li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-white">
                      Desempenho Esperado
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Retornos históricos e projetados para esta alocação
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 dark:text-white">
                          Retorno Anual Esperado
                        </h4>
                        <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: "65%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-sm dark:text-gray-300">
                          <span>0%</span>
                          <span className="font-medium dark:text-white">
                            6.5%
                          </span>
                          <span>12%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 dark:text-white">
                          Volatilidade Esperada
                        </h4>
                        <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: "40%" }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-sm dark:text-gray-300">
                          <span>Baixa</span>
                          <span className="font-medium dark:text-white">
                            Moderada
                          </span>
                          <span>Alta</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h4 className="font-semibold mb-2 dark:text-white">
                          Desempenho Histórico (Simulado)
                        </h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              { month: "Jan", return: 2.1 },
                              { month: "Fev", return: 2.3 },
                              { month: "Mar", return: 1.8 },
                              { month: "Abr", return: 2.0 },
                              { month: "Mai", return: 1.5 },
                              { month: "Jun", return: 1.9 },
                              { month: "Jul", return: 2.2 },
                              { month: "Ago", return: 2.4 },
                              { month: "Set", return: 2.0 },
                              { month: "Out", return: 2.3 },
                              { month: "Nov", return: 2.5 },
                              { month: "Dez", return: 2.7 },
                            ]}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Retorno"]}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="return"
                              stroke="#0088FE"
                              name="Retorno"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
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
          <div className="mt-8 pt-6 border-t text-sm text-gray-500 dark:text-gray-400 dark:border-gray-700">
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

        <div className="mt-6 flex justify-end no-print">
          <Button
            onClick={onDownload}
            className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
          >
            Gerar Relatório Final
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
