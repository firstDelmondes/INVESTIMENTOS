import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import step components
import ClientInfoStep from "./ClientInfoStep";
import RiskProfileStep from "./RiskProfileStep";
import InvestmentHorizonStep from "./InvestmentHorizonStep";
import AssetClassesStep from "./AssetClassesStep";
import StrategySelectionStep from "./StrategySelectionStep";
import RecommendationPreview from "./RecommendationPreview";
import { db } from "@/lib/db";
import {
  calculateRecommendedHorizon,
  calculateRecommendedRiskProfile,
  calculateRecommendedStrategy,
} from "./utils/investmentUtils";

interface RecommendationFormProps {
  onComplete?: (formData: RecommendationFormData) => void;
  initialData?: Partial<RecommendationFormData>;
}

export interface RecommendationFormData {
  clientName: string;
  clientAge: number;
  investmentObjective: string;
  investmentValue: number;
  riskProfile: string;
  investmentHorizon: {
    years: number;
    type: string;
  };
  assetClasses: string[];
  strategy: string;
}

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  onComplete = () => {},
  initialData = {},
}) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<string>("client-info");
  const [formData, setFormData] = useState<RecommendationFormData>({
    clientName: initialData.clientName || "",
    clientAge: initialData.clientAge || 35,
    investmentObjective: initialData.investmentObjective || "wealth",
    investmentValue: initialData.investmentValue || 100000,
    riskProfile: initialData.riskProfile || "moderado",
    investmentHorizon: initialData.investmentHorizon || {
      years: 5,
      type: "medio-prazo",
    },
    assetClasses: initialData.assetClasses || [
      "acoes-brasileiras-large-cap",
      "tesouro-direto",
      "cdbs",
      "fundos-imobiliarios",
    ],
    strategy: initialData.strategy || "allweather",
  });

  const steps = [
    { id: "client-info", label: "Dados do Cliente" },
    { id: "risk-profile", label: "Perfil de Risco" },
    { id: "investment-horizon", label: "Horizonte de Investimento" },
    { id: "asset-classes", label: "Classes de Ativos" },
    { id: "strategy", label: "Estratégia" },
    { id: "preview", label: "Visualização" },
  ];

  const handleClientInfoNext = (data: {
    clientName: string;
    clientAge: number;
    investmentObjective: string;
    investmentValue: number;
  }) => {
    // Calcular horizonte recomendado com base na idade e objetivo
    const recommendedYears = calculateRecommendedHorizon(
      data.clientAge,
      data.investmentObjective,
    );
    let horizonType = "medio-prazo";

    if (recommendedYears <= 3) {
      horizonType = "curto-prazo";
    } else if (recommendedYears >= 10) {
      horizonType = "longo-prazo";
    }

    // Atualizar os dados do formulário
    setFormData((prev) => ({
      ...prev,
      clientName: data.clientName,
      clientAge: data.clientAge,
      investmentObjective: data.investmentObjective,
      investmentValue: data.investmentValue,
      investmentHorizon: {
        ...prev.investmentHorizon,
        years: recommendedYears,
        type: horizonType,
      },
    }));

    // Calcular perfil de risco recomendado
    const recommendedProfile = calculateRecommendedRiskProfile(
      data.clientAge,
      data.investmentObjective,
    );
    setFormData((prev) => ({ ...prev, riskProfile: recommendedProfile }));

    // Avançar para o próximo passo
    setActiveStep("risk-profile");
  };

  const handleRiskProfileNext = (profile: string) => {
    setFormData((prev) => ({ ...prev, riskProfile: profile }));
    setActiveStep("investment-horizon");
  };

  const handleHorizonNext = () => {
    setActiveStep("asset-classes");
  };

  const handleHorizonPrevious = () => {
    setActiveStep("risk-profile");
  };

  const handleHorizonUpdate = (horizon: { years: number; type: string }) => {
    setFormData((prev) => ({ ...prev, investmentHorizon: horizon }));
  };

  const handleAssetClassesNext = (selectedAssets: string[]) => {
    setFormData((prev) => ({ ...prev, assetClasses: selectedAssets }));
    setActiveStep("strategy");
  };

  const handleAssetClassesPrevious = () => {
    setActiveStep("investment-horizon");
  };

  const handleStrategyNext = (data: { strategy: string }) => {
    setFormData((prev) => ({ ...prev, strategy: data.strategy }));
    setActiveStep("preview");
  };

  const handleStrategyPrevious = () => {
    setActiveStep("asset-classes");
  };

  const handlePreviewEdit = () => {
    setActiveStep("client-info");
  };

  // Função para mapear o ID da estratégia para o nome exibível
  const getEstrategiaNome = (strategyId: string): string => {
    const estrategiasMap: Record<string, string> = {
      permanent: "Portfólio Permanente",
      allweather: "Portfólio All Weather",
      traditional: "Tradicional 60/40",
      markowitz: "Otimização de Markowitz",
      riskparity: "Paridade de Risco",
      blacklitterman: "Black-Litterman",
      equalweight: "Pesos Iguais",
      momentum: "Momentum e Rotação",
      minimumvariance: "Variância Mínima",
      custom: "Alocação Personalizada",
    };

    return estrategiasMap[strategyId] || "Alocação Personalizada";
  };

  const handlePreviewContinue = async () => {
    try {
      // Preparar dados para salvar no banco de dados local
      const estrategiaNome = getEstrategiaNome(formData.strategy);

      const horizonteTexto = `${formData.investmentHorizon.years} anos (${formData.investmentHorizon.type === "curto-prazo" ? "Curto Prazo" : formData.investmentHorizon.type === "medio-prazo" ? "Médio Prazo" : "Longo Prazo"})`;

      // Gerar alocação de ativos baseada na estratégia e perfil
      const alocacaoAtivos = gerarAlocacaoAtivos(
        formData.strategy,
        formData.riskProfile,
      );

      // Calcular valor por relatório (simulado com base no valor de investimento)
      const valorPorRelatorio = formData.investmentValue * 0.05; // 5% do valor investido como exemplo

      // Salvar no banco de dados local
      const id = await db.recomendacoes.add({
        titulo: `${formData.clientName} - ${formData.riskProfile === "conservador" ? "Conservador" : formData.riskProfile === "moderado" ? "Moderado" : "Agressivo"} - ${new Date().toLocaleDateString("pt-BR")}`,
        data: new Date(),
        nomeCliente: formData.clientName,
        idadeCliente: formData.clientAge,
        objetivoInvestimento: formData.investmentObjective,
        valorInvestimento: formData.investmentValue,
        perfilRisco:
          formData.riskProfile === "conservador"
            ? "Conservador"
            : formData.riskProfile === "moderado"
              ? "Moderado"
              : "Agressivo",
        horizonteInvestimento: horizonteTexto,
        estrategia: estrategiaNome,
        alocacaoAtivos: alocacaoAtivos,
        status: "Rascunho",
        valorPorRelatorio: valorPorRelatorio,
      });

      // Chamar callback se fornecido
      onComplete(formData);

      // Navegar para a visualização da recomendação
      navigate(`/recommendation/${id}`);
    } catch (error) {
      console.error("Erro ao salvar recomendação:", error);
    }
  };

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex((step) => step.id === activeStep);
    const stepIndex = steps.findIndex((step) => step.id === stepId);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  // Função para gerar alocação de ativos baseada na estratégia, perfil, idade e objetivo
  const gerarAlocacaoAtivos = (estrategia: string, perfil: string) => {
    let alocacao = [];
    const idade = formData.clientAge;
    const objetivo = formData.investmentObjective;

    // Ajustes baseados na idade e objetivo
    const ajustarPorIdadeEObjetivo = (alocacaoBase) => {
      let alocacaoAjustada = [...alocacaoBase];

      // Ajustes por idade
      if (idade < 30) {
        // Jovens podem ter mais ações
        alocacaoAjustada = alocacaoAjustada.map((item) => {
          if (item.nome.includes("Ações")) {
            return { ...item, percentual: Math.min(item.percentual + 5, 80) };
          } else if (item.nome.includes("Caixa")) {
            return { ...item, percentual: Math.max(item.percentual - 5, 0) };
          }
          return item;
        });
      } else if (idade > 55) {
        // Mais velhos precisam de mais segurança
        alocacaoAjustada = alocacaoAjustada.map((item) => {
          if (
            item.nome.includes("Renda Fixa") ||
            item.nome.includes("Títulos")
          ) {
            return { ...item, percentual: Math.min(item.percentual + 5, 70) };
          } else if (item.nome.includes("Ações")) {
            return { ...item, percentual: Math.max(item.percentual - 5, 10) };
          }
          return item;
        });
      }

      // Ajustes por objetivo
      switch (objetivo) {
        case "retirement":
          // Aposentadoria: mais conservador conforme se aproxima
          if (idade > 45) {
            alocacaoAjustada = alocacaoAjustada.map((item) => {
              if (
                item.nome.includes("Renda Fixa") ||
                item.nome.includes("Títulos")
              ) {
                return {
                  ...item,
                  percentual: Math.min(item.percentual + 10, 70),
                };
              } else if (item.nome.includes("Ações")) {
                return {
                  ...item,
                  percentual: Math.max(item.percentual - 10, 10),
                };
              }
              return item;
            });
          }
          break;
        case "reserve":
          // Reserva de emergência: muito mais conservador
          alocacaoAjustada = alocacaoAjustada.map((item) => {
            if (
              item.nome.includes("Caixa") ||
              item.nome.includes("Renda Fixa")
            ) {
              return {
                ...item,
                percentual: Math.min(item.percentual + 15, 80),
              };
            } else if (
              item.nome.includes("Ações") ||
              item.nome.includes("Alternativos")
            ) {
              return { ...item, percentual: Math.max(item.percentual - 15, 0) };
            }
            return item;
          });
          break;
        case "education":
          // Educação: depende do prazo, mas geralmente mais conservador
          alocacaoAjustada = alocacaoAjustada.map((item) => {
            if (
              item.nome.includes("Renda Fixa") ||
              item.nome.includes("Títulos")
            ) {
              return { ...item, percentual: Math.min(item.percentual + 5, 65) };
            } else if (item.nome.includes("Ações")) {
              return { ...item, percentual: Math.max(item.percentual - 5, 15) };
            }
            return item;
          });
          break;
        case "property":
          // Compra de imóvel: mais conservador conforme se aproxima do objetivo
          alocacaoAjustada = alocacaoAjustada.map((item) => {
            if (
              item.nome.includes("Renda Fixa") ||
              item.nome.includes("Títulos")
            ) {
              return { ...item, percentual: Math.min(item.percentual + 5, 65) };
            } else if (item.nome.includes("Ações")) {
              return { ...item, percentual: Math.max(item.percentual - 5, 15) };
            }
            return item;
          });
          break;
        case "wealth":
          // Crescimento de patrimônio: mais agressivo
          alocacaoAjustada = alocacaoAjustada.map((item) => {
            if (
              item.nome.includes("Ações") ||
              item.nome.includes("Alternativos")
            ) {
              return { ...item, percentual: Math.min(item.percentual + 5, 75) };
            } else if (item.nome.includes("Caixa")) {
              return { ...item, percentual: Math.max(item.percentual - 5, 0) };
            }
            return item;
          });
          break;
        case "income":
          // Geração de renda: foco em dividendos e renda fixa
          alocacaoAjustada = alocacaoAjustada.map((item) => {
            if (
              item.nome.includes("Renda Fixa") ||
              item.nome.includes("Títulos")
            ) {
              return { ...item, percentual: Math.min(item.percentual + 5, 60) };
            } else if (item.nome.includes("Alternativos")) {
              return { ...item, percentual: Math.min(item.percentual + 5, 25) };
            }
            return item;
          });
          break;
      }

      // Normalizar percentuais para somar 100%
      const total = alocacaoAjustada.reduce(
        (sum, item) => sum + item.percentual,
        0,
      );
      if (total !== 100) {
        const fator = 100 / total;
        alocacaoAjustada = alocacaoAjustada.map((item) => ({
          ...item,
          percentual: Math.round(item.percentual * fator * 10) / 10,
        }));
      }

      return alocacaoAjustada;
    };

    // Definir alocação baseada na estratégia selecionada
    switch (estrategia) {
      case "permanent":
        // Portfólio Permanente - 25% em cada classe principal
        alocacao = [
          { nome: "Ações", percentual: 25, cor: "#4f46e5" },
          { nome: "Títulos de Longo Prazo", percentual: 25, cor: "#10b981" },
          { nome: "Ouro", percentual: 25, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 25, cor: "#6b7280" },
        ];
        break;

      case "allweather":
        // All Weather - ajustado por perfil de risco
        if (perfil === "conservador") {
          alocacao = [
            { nome: "Ações", percentual: 20, cor: "#4f46e5" },
            { nome: "Títulos de Longo Prazo", percentual: 40, cor: "#10b981" },
            { nome: "Títulos de Médio Prazo", percentual: 15, cor: "#06b6d4" },
            { nome: "Ouro", percentual: 15, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 10, cor: "#6b7280" },
          ];
        } else if (perfil === "moderado") {
          alocacao = [
            { nome: "Ações", percentual: 30, cor: "#4f46e5" },
            { nome: "Títulos de Longo Prazo", percentual: 40, cor: "#10b981" },
            { nome: "Títulos de Médio Prazo", percentual: 15, cor: "#06b6d4" },
            { nome: "Ouro", percentual: 7.5, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 7.5, cor: "#6b7280" },
          ];
        } else {
          // agressivo
          alocacao = [
            { nome: "Ações", percentual: 40, cor: "#4f46e5" },
            { nome: "Títulos de Longo Prazo", percentual: 30, cor: "#10b981" },
            { nome: "Títulos de Médio Prazo", percentual: 15, cor: "#06b6d4" },
            { nome: "Ouro", percentual: 7.5, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 7.5, cor: "#6b7280" },
          ];
        }
        break;

      case "traditional":
        // Tradicional 60/40 - ajustado por perfil de risco
        if (perfil === "conservador") {
          alocacao = [
            { nome: "Ações", percentual: 40, cor: "#4f46e5" },
            { nome: "Títulos de Renda Fixa", percentual: 50, cor: "#10b981" },
            { nome: "Caixa", percentual: 10, cor: "#6b7280" },
          ];
        } else if (perfil === "moderado") {
          alocacao = [
            { nome: "Ações", percentual: 60, cor: "#4f46e5" },
            { nome: "Títulos de Renda Fixa", percentual: 35, cor: "#10b981" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        } else {
          // agressivo
          alocacao = [
            { nome: "Ações", percentual: 75, cor: "#4f46e5" },
            { nome: "Títulos de Renda Fixa", percentual: 20, cor: "#10b981" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        }
        break;

      case "markowitz":
        // Otimização de Markowitz
        if (perfil === "conservador") {
          alocacao = [
            { nome: "Ações", percentual: 30, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 50, cor: "#10b981" },
            { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 10, cor: "#6b7280" },
          ];
        } else if (perfil === "moderado") {
          alocacao = [
            { nome: "Ações", percentual: 45, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 35, cor: "#10b981" },
            { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        } else {
          alocacao = [
            { nome: "Ações", percentual: 65, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 20, cor: "#10b981" },
            { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        }
        break;

      case "riskparity":
        // Paridade de Risco
        alocacao = [
          { nome: "Ações", percentual: 25, cor: "#4f46e5" },
          { nome: "Títulos de Longo Prazo", percentual: 35, cor: "#10b981" },
          { nome: "Títulos de Médio Prazo", percentual: 20, cor: "#06b6d4" },
          { nome: "Commodities", percentual: 15, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
        break;

      case "blacklitterman":
        // Black-Litterman
        alocacao = [
          { nome: "Ações Domésticas", percentual: 30, cor: "#4f46e5" },
          { nome: "Ações Internacionais", percentual: 20, cor: "#8b5cf6" },
          { nome: "Renda Fixa", percentual: 35, cor: "#10b981" },
          { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
        break;

      case "equalweight":
        // Pesos Iguais
        alocacao = [
          { nome: "Ações", percentual: 25, cor: "#4f46e5" },
          { nome: "Renda Fixa", percentual: 25, cor: "#10b981" },
          { nome: "Imóveis", percentual: 25, cor: "#06b6d4" },
          { nome: "Commodities", percentual: 25, cor: "#f59e0b" },
        ];
        break;

      case "momentum":
        // Momentum e Rotação
        alocacao = [
          { nome: "Ações de Alto Momentum", percentual: 40, cor: "#4f46e5" },
          { nome: "Setores Cíclicos", percentual: 25, cor: "#8b5cf6" },
          { nome: "Renda Fixa", percentual: 20, cor: "#10b981" },
          { nome: "Commodities", percentual: 10, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
        break;

      case "minimumvariance":
        // Variância Mínima
        alocacao = [
          {
            nome: "Ações de Baixa Volatilidade",
            percentual: 30,
            cor: "#4f46e5",
          },
          {
            nome: "Renda Fixa de Alta Qualidade",
            percentual: 45,
            cor: "#10b981",
          },
          {
            nome: "Títulos Indexados à Inflação",
            percentual: 15,
            cor: "#06b6d4",
          },
          { nome: "Caixa", percentual: 10, cor: "#6b7280" },
        ];
        break;

      default:
        // Personalizado - alocação baseada no perfil, idade e objetivo
        if (perfil === "conservador") {
          alocacao = [
            { nome: "Ações", percentual: 20, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 60, cor: "#10b981" },
            { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 10, cor: "#6b7280" },
          ];
        } else if (perfil === "moderado") {
          alocacao = [
            { nome: "Ações", percentual: 40, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 40, cor: "#10b981" },
            { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        } else {
          // agressivo
          alocacao = [
            { nome: "Ações", percentual: 60, cor: "#4f46e5" },
            { nome: "Renda Fixa", percentual: 20, cor: "#10b981" },
            { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
            { nome: "Caixa", percentual: 5, cor: "#6b7280" },
          ];
        }

        // Aplicar ajustes específicos para o objetivo
        if (objetivo === "income") {
          // Para geração de renda, adicionar categoria específica
          alocacao = [
            ...alocacao.filter((item) => !item.nome.includes("Ações")),
            {
              nome: "Ações de Dividendos",
              percentual:
                alocacao.find((item) => item.nome === "Ações")?.percentual ||
                30,
              cor: "#4f46e5",
            },
            { nome: "Fundos Imobiliários", percentual: 15, cor: "#8b5cf6" },
          ];
        } else if (objetivo === "retirement" && idade > 50) {
          // Para aposentadoria próxima, adicionar categoria específica
          alocacao = [
            ...alocacao.filter((item) => !item.nome.includes("Renda Fixa")),
            {
              nome: "Títulos Indexados à Inflação",
              percentual:
                alocacao.find((item) => item.nome === "Renda Fixa")
                  ?.percentual || 40,
              cor: "#10b981",
            },
            { nome: "Previdência Privada", percentual: 15, cor: "#0ea5e9" },
          ];
        }
        break;
    }

    // Aplicar ajustes por idade e objetivo para todas as estratégias
    return ajustarPorIdadeEObjetivo(alocacao);
  };

  // Renderizar o componente de passo atual
  const renderStep = () => {
    switch (activeStep) {
      case "client-info":
        return (
          <ClientInfoStep
            onNext={handleClientInfoNext}
            initialValues={{
              clientName: formData.clientName,
              clientAge: formData.clientAge,
              investmentObjective: formData.investmentObjective,
              investmentValue: formData.investmentValue,
            }}
          />
        );
      case "risk-profile":
        return (
          <RiskProfileStep
            onNext={handleRiskProfileNext}
            selectedProfile={formData.riskProfile}
            clientAge={formData.clientAge}
            investmentObjective={formData.investmentObjective}
          />
        );
      case "investment-horizon":
        return (
          <InvestmentHorizonStep
            onNext={handleHorizonNext}
            onPrevious={handleHorizonPrevious}
            onUpdate={handleHorizonUpdate}
            initialHorizon={formData.investmentHorizon}
          />
        );
      case "asset-classes":
        return (
          <AssetClassesStep
            onNext={handleAssetClassesNext}
            onPrevious={handleAssetClassesPrevious}
            preselectedAssets={formData.assetClasses}
          />
        );
      case "strategy":
        return (
          <StrategySelectionStep
            onNext={handleStrategyNext}
            onPrevious={handleStrategyPrevious}
            selectedStrategy={formData.strategy}
            riskProfile={formData.riskProfile}
            investmentObjective={formData.investmentObjective}
          />
        );
      case "preview":
        return (
          <RecommendationPreview
            clientName={formData.clientName}
            clientAge={formData.clientAge}
            investmentObjective={formData.investmentObjective}
            investmentValue={formData.investmentValue}
            riskProfile={
              formData.riskProfile === "conservador"
                ? "Conservador"
                : formData.riskProfile === "moderado"
                  ? "Moderado"
                  : "Agressivo"
            }
            investmentHorizon={`${formData.investmentHorizon.years} anos (${formData.investmentHorizon.type === "curto-prazo" ? "Curto Prazo" : formData.investmentHorizon.type === "medio-prazo" ? "Médio Prazo" : "Longo Prazo"})`}
            strategy={getEstrategiaNome(formData.strategy)}
            allocations={gerarAlocacaoAtivos(
              formData.strategy,
              formData.riskProfile,
            )}
            onEdit={handlePreviewEdit}
            onContinue={handlePreviewContinue}
          />
        );
      default:
        return <div>Passo não encontrado</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nova Recomendação de Investimento
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Preencha os dados para gerar uma recomendação personalizada de
            alocação de ativos.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${getStepStatus(step.id) === "complete" ? "bg-green-500" : getStepStatus(step.id) === "current" ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"} text-white`}
                  >
                    {getStepStatus(step.id) === "complete" ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm ${getStepStatus(step.id) === "complete" ? "text-green-500" : getStepStatus(step.id) === "current" ? "text-blue-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${index < steps.findIndex((s) => s.id === activeStep) ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationForm;
