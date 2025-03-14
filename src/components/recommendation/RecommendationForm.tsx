import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import step components
import RiskProfileStep from "./RiskProfileStep";
import InvestmentHorizonStep from "./InvestmentHorizonStep";
import AssetClassesStep from "./AssetClassesStep";
import StrategySelectionStep from "./StrategySelectionStep";
import RecommendationPreview from "./RecommendationPreview";
import { db } from "@/lib/db";

interface RecommendationFormProps {
  onComplete?: (formData: RecommendationFormData) => void;
  initialData?: Partial<RecommendationFormData>;
}

export interface RecommendationFormData {
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
  const [activeStep, setActiveStep] = useState<string>("risk-profile");
  const [formData, setFormData] = useState<RecommendationFormData>({
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
    { id: "risk-profile", label: "Perfil de Risco" },
    { id: "investment-horizon", label: "Horizonte de Investimento" },
    { id: "asset-classes", label: "Classes de Ativos" },
    { id: "strategy", label: "Estratégia" },
    { id: "preview", label: "Visualização" },
  ];

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
    setActiveStep("risk-profile");
  };

  const handlePreviewContinue = async () => {
    try {
      // Preparar dados para salvar no banco de dados local
      const estrategiaNome =
        formData.strategy === "permanent"
          ? "Portfólio Permanente"
          : formData.strategy === "allweather"
            ? "Portfólio All Weather"
            : formData.strategy === "traditional"
              ? "Tradicional 60/40"
              : "Alocação Personalizada";

      const horizonteTexto = `${formData.investmentHorizon.years} anos (${formData.investmentHorizon.type === "curto-prazo" ? "Curto Prazo" : formData.investmentHorizon.type === "medio-prazo" ? "Médio Prazo" : "Longo Prazo"})`;

      // Gerar alocação de ativos baseada na estratégia e perfil
      const alocacaoAtivos = gerarAlocacaoAtivos(
        formData.strategy,
        formData.riskProfile,
      );

      // Salvar no banco de dados local
      const id = await db.recomendacoes.add({
        titulo: `${formData.riskProfile === "conservador" ? "Conservador" : formData.riskProfile === "moderado" ? "Moderado" : "Agressivo"} - ${new Date().toLocaleDateString("pt-BR")}`,
        data: new Date(),
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

  // Função para gerar alocação de ativos baseada na estratégia e perfil
  const gerarAlocacaoAtivos = (estrategia: string, perfil: string) => {
    let alocacao = [];

    if (estrategia === "permanent") {
      // Portfólio Permanente - 25% em cada classe principal
      alocacao = [
        { nome: "Ações", percentual: 25, cor: "#4f46e5" },
        { nome: "Títulos de Longo Prazo", percentual: 25, cor: "#10b981" },
        { nome: "Ouro", percentual: 25, cor: "#f59e0b" },
        { nome: "Caixa", percentual: 25, cor: "#6b7280" },
      ];
    } else if (estrategia === "allweather") {
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
    } else if (estrategia === "traditional") {
      // Tradicional 60/40 - ajustado por perfil de risco
      if (perfil === "conservador") {
        alocacao = [
          { nome: "Ações", percentual: 40, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 50, cor: "#10b981" },
          { nome: "Caixa", percentual: 10, cor: "#6b7280" },
        ];
      } else if (perfil === "moderado") {
        alocacao = [
          { nome: "Ações", percentual: 60, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 35, cor: "#10b981" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
      } else {
        // agressivo
        alocacao = [
          { nome: "Ações", percentual: 75, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 20, cor: "#10b981" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
      }
    } else {
      // custom
      // Alocação personalizada baseada no perfil
      if (perfil === "conservador") {
        alocacao = [
          { nome: "Ações", percentual: 20, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 50, cor: "#10b981" },
          { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 20, cor: "#6b7280" },
        ];
      } else if (perfil === "moderado") {
        alocacao = [
          { nome: "Ações", percentual: 40, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 35, cor: "#10b981" },
          { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 10, cor: "#6b7280" },
        ];
      } else {
        // agressivo
        alocacao = [
          { nome: "Ações", percentual: 60, cor: "#4f46e5" },
          { nome: "Títulos", percentual: 20, cor: "#10b981" },
          { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];
      }
    }

    return alocacao;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-background">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Criar Recomendação de Investimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepStatus(step.id) === "complete" ? "bg-green-500 text-white" : getStepStatus(step.id) === "current" ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {getStepStatus(step.id) === "complete" ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm ${getStepStatus(step.id) === "current" ? "font-medium text-primary" : "text-gray-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${index < steps.findIndex((s) => s.id === activeStep) ? "bg-green-500" : "bg-gray-200"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        {activeStep === "risk-profile" && (
          <RiskProfileStep
            onNext={handleRiskProfileNext}
            selectedProfile={formData.riskProfile}
          />
        )}

        {activeStep === "investment-horizon" && (
          <InvestmentHorizonStep
            onNext={handleHorizonNext}
            onPrevious={handleHorizonPrevious}
            onUpdateHorizon={handleHorizonUpdate}
            initialHorizon={formData.investmentHorizon}
          />
        )}

        {activeStep === "asset-classes" && (
          <AssetClassesStep
            onNext={handleAssetClassesNext}
            onPrevious={handleAssetClassesPrevious}
            preselectedAssets={formData.assetClasses}
          />
        )}

        {activeStep === "strategy" && (
          <StrategySelectionStep
            onNext={handleStrategyNext}
            onBack={handleStrategyPrevious}
            defaultValues={{ strategy: formData.strategy }}
          />
        )}

        {activeStep === "preview" && (
          <RecommendationPreview
            riskProfile={
              formData.riskProfile === "conservador"
                ? "Conservador"
                : formData.riskProfile === "moderado"
                  ? "Moderado"
                  : "Agressivo"
            }
            investmentHorizon={`${formData.investmentHorizon.years} anos (${formData.investmentHorizon.type === "curto-prazo" ? "Curto Prazo" : formData.investmentHorizon.type === "medio-prazo" ? "Médio Prazo" : "Longo Prazo"})`}
            strategy={
              formData.strategy === "permanent"
                ? "Portfólio Permanente"
                : formData.strategy === "allweather"
                  ? "Portfólio All Weather"
                  : formData.strategy === "traditional"
                    ? "Tradicional 60/40"
                    : "Alocação Personalizada"
            }
            onEdit={handlePreviewEdit}
            onContinue={handlePreviewContinue}
          />
        )}
      </div>
    </div>
  );
};

export default RecommendationForm;
