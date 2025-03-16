import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Shield, TrendingUp, Zap, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface RiskProfileStepProps {
  onNext?: (profile: string) => void;
  selectedProfile?: string;
  clientAge?: number;
  investmentObjective?: string;
}

const RiskProfileStep = ({
  onNext = () => {},
  selectedProfile = "moderado",
  clientAge = 35,
  investmentObjective = "wealth",
}: RiskProfileStepProps) => {
  const [selectedRiskProfile, setSelectedRiskProfile] =
    useState<string>(selectedProfile);

  // Função para recomendar um perfil com base na idade e objetivo
  const getRecommendedProfile = () => {
    // Lógica baseada na idade
    let recommendedProfile = "moderado";

    if (clientAge < 30) {
      recommendedProfile = "agressivo";
    } else if (clientAge > 55) {
      recommendedProfile = "conservador";
    }

    // Ajuste baseado no objetivo
    if (investmentObjective === "retirement" && clientAge > 45) {
      recommendedProfile = "conservador";
    } else if (investmentObjective === "reserve") {
      recommendedProfile = "conservador";
    } else if (investmentObjective === "wealth" && clientAge < 40) {
      recommendedProfile = "agressivo";
    }

    return recommendedProfile;
  };

  const handleNext = () => {
    onNext(selectedRiskProfile);
  };

  const getProfileDetails = (profile: string) => {
    switch (profile) {
      case "conservador":
        return {
          title: "Conservador",
          icon: <Shield className="h-12 w-12 text-blue-500" />,
          description:
            "Prioriza a preservação do capital e a estabilidade, com foco em investimentos de baixo risco.",
          details:
            "Adequado para investidores que não toleram perdas significativas e preferem segurança a retornos potencialmente maiores. Ideal para horizontes de curto prazo ou para quem está próximo da aposentadoria.",
          expectedReturn: "4% a 8% ao ano",
          volatility: "Baixa",
          timeHorizon: "Curto a médio prazo (1-5 anos)",
          barWidth: "30%",
          barColor: "bg-blue-500",
        };
      case "moderado":
        return {
          title: "Moderado",
          icon: <TrendingUp className="h-12 w-12 text-yellow-500" />,
          description:
            "Busca equilíbrio entre segurança e crescimento, com diversificação entre diferentes classes de ativos.",
          details:
            "Adequado para investidores que aceitam alguma volatilidade em busca de retornos melhores no médio prazo. Combina investimentos de renda fixa com uma parcela moderada em ativos de maior risco.",
          expectedReturn: "7% a 12% ao ano",
          volatility: "Média",
          timeHorizon: "Médio prazo (5-10 anos)",
          barWidth: "60%",
          barColor: "bg-yellow-500",
        };
      case "agressivo":
        return {
          title: "Agressivo",
          icon: <Zap className="h-12 w-12 text-red-500" />,
          description:
            "Foco em maximizar o crescimento do capital, com maior exposição a ativos de risco e potencial de retornos elevados.",
          details:
            "Adequado para investidores que toleram alta volatilidade e eventuais perdas temporárias em busca de retornos superiores no longo prazo. Concentra-se em ações, fundos multimercado e investimentos alternativos.",
          expectedReturn: "10% a 18% ao ano",
          volatility: "Alta",
          timeHorizon: "Longo prazo (10+ anos)",
          barWidth: "90%",
          barColor: "bg-red-500",
        };
      default:
        return {
          title: "Moderado",
          icon: <TrendingUp className="h-12 w-12 text-yellow-500" />,
          description:
            "Busca equilíbrio entre segurança e crescimento, com diversificação entre diferentes classes de ativos.",
          details:
            "Adequado para investidores que aceitam alguma volatilidade em busca de retornos melhores no médio prazo. Combina investimentos de renda fixa com uma parcela moderada em ativos de maior risco.",
          expectedReturn: "7% a 12% ao ano",
          volatility: "Média",
          timeHorizon: "Médio prazo (5-10 anos)",
          barWidth: "60%",
          barColor: "bg-yellow-500",
        };
    }
  };

  const recommendedProfile = getRecommendedProfile();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background dark:bg-gray-800">
      <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">
            Selecione o Perfil de Risco
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            Escolha o perfil de risco que melhor corresponde aos seus objetivos
            de investimento e nível de conforto com as flutuações do mercado.
          </CardDescription>
          {recommendedProfile && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">
                    Recomendação Personalizada
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Com base na sua idade ({clientAge} anos) e objetivo de
                    investimento, recomendamos o perfil{" "}
                    <strong className="font-medium">
                      {recommendedProfile === "conservador"
                        ? "Conservador"
                        : recommendedProfile === "moderado"
                          ? "Moderado"
                          : "Agressivo"}
                    </strong>
                    . Esta é apenas uma sugestão, você pode escolher o perfil
                    que melhor se adeque às suas preferências.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedRiskProfile}
            onValueChange={setSelectedRiskProfile}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
          >
            {["conservador", "moderado", "agressivo"].map((profile) => {
              const profileData = getProfileDetails(profile);
              return (
                <label
                  key={profile}
                  htmlFor={profile}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer ${selectedRiskProfile === profile ? "border-primary" : "border-border dark:border-gray-600"} ${recommendedProfile === profile ? "bg-blue-50 dark:bg-blue-900/20" : "dark:bg-gray-700"}`}
                >
                  <div className="absolute right-4 top-4">
                    <RadioGroupItem
                      value={profile}
                      id={profile}
                      className="sr-only"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    {profileData.icon}
                    <h3 className="font-medium text-lg dark:text-white">
                      {profileData.title}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">
                      {profileData.description}
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${profileData.barColor} h-full`}
                        style={{ width: profileData.barWidth }}
                      ></div>
                    </div>
                    <div className="flex justify-between w-full text-xs dark:text-gray-300">
                      <span>Baixo Risco</span>
                      <span>Alto Risco</span>
                    </div>
                    <div className="w-full mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs dark:border-gray-600 dark:text-gray-300"
                              type="button"
                            >
                              <Info className="h-3 w-3 mr-1" /> Mais detalhes
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-4 dark:bg-gray-800 dark:border-gray-700">
                            <div className="space-y-2">
                              <p className="text-sm dark:text-gray-300">
                                {profileData.details}
                              </p>
                              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs dark:text-gray-300">
                                  <strong>Retorno esperado:</strong>{" "}
                                  {profileData.expectedReturn}
                                </p>
                                <p className="text-xs dark:text-gray-300">
                                  <strong>Volatilidade:</strong>{" "}
                                  {profileData.volatility}
                                </p>
                                <p className="text-xs dark:text-gray-300">
                                  <strong>Horizonte ideal:</strong>{" "}
                                  {profileData.timeHorizon}
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNext} size="lg">
            Continuar para o Próximo Passo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RiskProfileStep;
