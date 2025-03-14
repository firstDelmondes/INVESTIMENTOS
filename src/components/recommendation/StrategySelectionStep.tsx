import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Umbrella,
  BarChart3,
  Briefcase,
  Check,
  BarChart,
  Scale,
  TrendingUp,
  Layers,
  Gauge,
  Dices,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  strategy: z.enum(
    [
      "permanent",
      "allweather",
      "traditional",
      "custom",
      "markowitz",
      "riskparity",
      "blacklitterman",
      "equalweight",
      "momentum",
      "minimumvariance",
    ],
    {
      required_error: "Please select an allocation strategy",
    },
  ),
});

type StrategySelectionFormValues = z.infer<typeof formSchema>;

interface StrategySelectionStepProps {
  onNext?: (data: StrategySelectionFormValues) => void;
  onBack?: () => void;
  defaultValues?: StrategySelectionFormValues;
}

const StrategySelectionStep = ({
  onNext = () => {},
  onBack = () => {},
  defaultValues = { strategy: "permanent" },
}: StrategySelectionStepProps) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(
    defaultValues.strategy,
  );

  const form = useForm<StrategySelectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (data: StrategySelectionFormValues) => {
    onNext(data);
  };

  const strategies = [
    {
      id: "permanent",
      title: "Portfólio Permanente",
      description:
        "Alocação igual entre ações, títulos, caixa e ouro. Projetado para ter bom desempenho em todas as condições econômicas.",
      icon: <Shield className="h-10 w-10 text-blue-500" />,
      details:
        "Baixa volatilidade, retornos moderados. Ideal para investidores conservadores que buscam estabilidade.",
    },
    {
      id: "allweather",
      title: "Portfólio All Weather",
      description:
        "Abordagem de paridade de risco equilibrando cenários de crescimento, inflação, deflação e recessão.",
      icon: <Umbrella className="h-10 w-10 text-purple-500" />,
      details:
        "Volatilidade moderada, retornos moderados. Adequado para a maioria dos horizontes de investimento.",
    },
    {
      id: "traditional",
      title: "Tradicional 60/40",
      description:
        "Alocação clássica com 60% em ações e 40% em títulos, o padrão para portfólios balanceados.",
      icon: <BarChart3 className="h-10 w-10 text-green-500" />,
      details:
        "Volatilidade moderada, retornos moderados. Uma abordagem testada pelo tempo para investidores de longo prazo.",
    },
    {
      id: "markowitz",
      title: "Otimização de Markowitz",
      description:
        "Modelo de otimização média-variância que busca o maior retorno esperado para um dado nível de risco.",
      icon: <Gauge className="h-10 w-10 text-red-500" />,
      details:
        "Volatilidade variável, retornos potencialmente altos. Baseado na Teoria Moderna de Portfólios.",
    },
    {
      id: "riskparity",
      title: "Paridade de Risco",
      description:
        "Equilibra as contribuições de risco de cada ativo ou classe de ativos dentro do portfólio.",
      icon: <Scale className="h-10 w-10 text-indigo-500" />,
      details:
        "Volatilidade controlada, retornos balanceados. Foco na distribuição equilibrada do risco entre classes de ativos.",
    },
    {
      id: "blacklitterman",
      title: "Black-Litterman",
      description:
        "Combina a distribuição de retornos implícita no mercado com as visões do investidor sobre determinados ativos.",
      icon: <Layers className="h-10 w-10 text-cyan-500" />,
      details:
        "Volatilidade ajustável, retornos personalizados. Permite incorporar visões subjetivas sobre o mercado.",
    },
    {
      id: "equalweight",
      title: "Pesos Iguais",
      description:
        "Atribui o mesmo peso para cada ativo ou classe de ativos do portfólio, independente de volatilidade ou correlações.",
      icon: <Layers className="h-10 w-10 text-teal-500" />,
      details:
        "Volatilidade média, retornos diversificados. Abordagem simples que evita concentração excessiva.",
    },
    {
      id: "momentum",
      title: "Momentum e Rotação",
      description:
        "Utiliza indicadores de momentum e tendência para alocar mais capital em classes de ativos com melhor desempenho recente.",
      icon: <TrendingUp className="h-10 w-10 text-orange-500" />,
      details:
        "Volatilidade potencialmente alta, retornos potencialmente altos. Estratégia mais dinâmica e tática.",
    },
    {
      id: "minimumvariance",
      title: "Variância Mínima",
      description:
        "Busca construir um portfólio que minimize a variância total, independentemente do retorno esperado.",
      icon: <BarChart className="h-10 w-10 text-emerald-500" />,
      details:
        "Baixa volatilidade, retornos potencialmente menores. Foco na redução do risco total do portfólio.",
    },
    {
      id: "custom",
      title: "Alocação Personalizada",
      description:
        "Alocação personalizada baseada no seu perfil de risco específico e horizonte de investimento.",
      icon: <Briefcase className="h-10 w-10 text-amber-500" />,
      details:
        "Volatilidade e retornos dependem das suas seleções. Máxima flexibilidade para investidores experientes.",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Selecionar Estratégia de Alocação
          </h1>
          <p className="text-gray-600 mt-2">
            Escolha a estratégia de investimento que melhor se alinha aos seus
            objetivos e tolerância ao risco
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem className="space-y-6">
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedStrategy(value);
                      }}
                      defaultValue={field.value}
                      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    >
                      {strategies.map((strategy) => (
                        <div key={strategy.id} className="relative">
                          <RadioGroupItem
                            value={strategy.id}
                            id={strategy.id}
                            className="sr-only"
                          />
                          <label
                            htmlFor={strategy.id}
                            className={`flex flex-col h-full cursor-pointer rounded-xl border-2 p-6 ${selectedStrategy === strategy.id ? "border-primary bg-primary/5" : "border-muted bg-card"}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="p-2 rounded-full bg-primary/10">
                                {strategy.icon}
                              </div>
                              {selectedStrategy === strategy.id && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                  <Check className="h-4 w-4 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="mt-4">
                              <h3 className="font-medium text-lg">
                                {strategy.title}
                              </h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {strategy.description}
                              </p>
                              <p className="mt-4 text-xs text-muted-foreground italic">
                                {strategy.details}
                              </p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Voltar
              </Button>
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default StrategySelectionStep;
