import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, History, FileText, BarChart } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  buttonText: string;
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "link";
}

const QuickActionCard = ({
  title = "Título da Ação",
  description = "Descrição desta ação rápida",
  icon = <PlusCircle className="h-8 w-8" />,
  to = "/",
  buttonText = "Ir",
  variant = "default",
}: QuickActionCardProps) => {
  return (
    <Card className="w-full bg-white hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-16 flex items-center justify-center">
          {/* Placeholder for any additional content */}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant={variant} className="w-full" asChild>
          <Link to={to}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

interface QuickActionsProps {
  actions?: QuickActionCardProps[];
}

const QuickActions = ({
  actions = [
    {
      title: "Criar Nova Recomendação",
      description: "Iniciar uma nova recomendação de alocação de investimentos",
      icon: <PlusCircle className="h-8 w-8" />,
      to: "/recommendation/new",
      buttonText: "Criar Nova",
      variant: "default",
    },
    {
      title: "Ver Histórico",
      description: "Acessar recomendações geradas anteriormente",
      icon: <History className="h-8 w-8" />,
      to: "/history",
      buttonText: "Ver Histórico",
      variant: "secondary",
    },
    {
      title: "Gerar Relatório",
      description:
        "Criar um relatório PDF personalizado a partir dos dados existentes",
      icon: <FileText className="h-8 w-8" />,
      to: "/report/new",
      buttonText: "Gerar",
      variant: "outline",
    },
    {
      title: "Painel de Análise",
      description: "Visualizar métricas de desempenho e insights",
      icon: <BarChart className="h-8 w-8" />,
      to: "/",
      buttonText: "Ver Análises",
      variant: "ghost",
    },
  ],
}: QuickActionsProps) => {
  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Ações Rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <QuickActionCard key={index} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
