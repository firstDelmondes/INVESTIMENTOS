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
import { Shield, TrendingUp, Zap } from "lucide-react";

interface RiskProfileStepProps {
  onNext?: (profile: string) => void;
  selectedProfile?: string;
}

const RiskProfileStep = ({
  onNext = () => {},
  selectedProfile = "moderado",
}: RiskProfileStepProps) => {
  const [selectedRiskProfile, setSelectedRiskProfile] =
    useState<string>(selectedProfile);

  const handleNext = () => {
    onNext(selectedRiskProfile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Selecione o Perfil de Risco
          </CardTitle>
          <CardDescription>
            Escolha o perfil de risco que melhor corresponde aos seus objetivos
            de investimento e nível de conforto com as flutuações do mercado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedRiskProfile}
            onValueChange={setSelectedRiskProfile}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
          >
            <div
              className={`relative rounded-lg border-2 p-6 ${selectedRiskProfile === "conservador" ? "border-primary" : "border-border"}`}
            >
              <div className="absolute right-4 top-4">
                <RadioGroupItem
                  value="conservador"
                  id="conservador"
                  className="sr-only"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <Shield className="h-12 w-12 text-blue-500" />
                <h3 className="font-medium text-lg">Conservador</h3>
                <p className="text-sm text-muted-foreground">
                  Menor risco com retornos estáveis. Foco na preservação de
                  capital com volatilidade mínima.
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs">
                  <span>Baixo Risco</span>
                  <span>Alto Risco</span>
                </div>
              </div>
            </div>

            <div
              className={`relative rounded-lg border-2 p-6 ${selectedRiskProfile === "moderado" ? "border-primary" : "border-border"}`}
            >
              <div className="absolute right-4 top-4">
                <RadioGroupItem
                  value="moderado"
                  id="moderado"
                  className="sr-only"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <TrendingUp className="h-12 w-12 text-yellow-500" />
                <h3 className="font-medium text-lg">Moderado</h3>
                <p className="text-sm text-muted-foreground">
                  Abordagem equilibrada com risco moderado e potencial de
                  crescimento. Mistura de ativos estáveis e orientados ao
                  crescimento.
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs">
                  <span>Baixo Risco</span>
                  <span>Alto Risco</span>
                </div>
              </div>
            </div>

            <div
              className={`relative rounded-lg border-2 p-6 ${selectedRiskProfile === "agressivo" ? "border-primary" : "border-border"}`}
            >
              <div className="absolute right-4 top-4">
                <RadioGroupItem
                  value="agressivo"
                  id="agressivo"
                  className="sr-only"
                />
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <Zap className="h-12 w-12 text-red-500" />
                <h3 className="font-medium text-lg">Agressivo</h3>
                <p className="text-sm text-muted-foreground">
                  Maior risco com potencial para retornos significativos. Foco
                  no crescimento com aceitação de maior volatilidade.
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-xs">
                  <span>Baixo Risco</span>
                  <span>Alto Risco</span>
                </div>
              </div>
            </div>
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
