import React, { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Edit, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Recomendacao, db } from "@/lib/db";

interface RecommendationRecord {
  id: string;
  title: string;
  createdAt: Date;
  riskProfile: "Conservative" | "Moderate" | "Aggressive";
  investmentHorizon: string;
  strategy: string;
  status: "Draft" | "Final";
}

interface HistoryTableProps {
  recommendations?: RecommendationRecord[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onExport?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const HistoryTable = ({
  recommendations = [],
  onView = () => {},
  onEdit = () => {},
  onExport = () => {},
  onDelete = () => {},
}: HistoryTableProps) => {
  const [recomendacoes, setRecomendacoes] = useState<RecommendationRecord[]>(
    [],
  );

  useEffect(() => {
    loadRecommendations();
  }, [recommendations]);

  const loadRecommendations = async () => {
    try {
      // Se recommendations foi fornecido como prop, use-o
      if (recommendations && recommendations.length > 0) {
        setRecomendacoes(recommendations);
        return;
      }

      // Caso contrário, carregue do banco de dados
      const dbRecomendacoes = await db.recomendacoes.toArray();

      // Converter do formato do banco para o formato esperado pelo componente
      const formattedRecommendations = dbRecomendacoes.map((rec) => ({
        id: rec.id?.toString() || "",
        title: rec.titulo,
        createdAt: new Date(rec.data),
        riskProfile: mapRiskProfile(rec.perfilRisco),
        investmentHorizon: rec.horizonteInvestimento,
        strategy: rec.estrategia,
        status: rec.status === "Rascunho" ? "Draft" : "Final",
      }));

      setRecomendacoes(formattedRecommendations);
    } catch (error) {
      console.error("Erro ao carregar recomendações:", error);
    }
  };

  const mapRiskProfile = (
    profile: string,
  ): "Conservative" | "Moderate" | "Aggressive" => {
    if (!profile) return "Moderate";
    if (profile === "Conservador") return "Conservative";
    if (profile === "Moderado") return "Moderate";
    return "Aggressive";
  };
  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case "Conservative":
        return "secondary";
      case "Moderate":
        return "default";
      case "Aggressive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Final" ? "secondary" : "outline";
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-md border shadow-sm dark:border-gray-700">
      <Table>
        <TableCaption className="dark:text-gray-300">
          Histórico de recomendações de alocação de investimentos
        </TableCaption>
        <TableHeader>
          <TableRow className="dark:border-gray-700">
            <TableHead className="dark:text-gray-300">Título</TableHead>
            <TableHead className="dark:text-gray-300">Criado em</TableHead>
            <TableHead className="dark:text-gray-300">
              Perfil de Risco
            </TableHead>
            <TableHead className="dark:text-gray-300">
              Horizonte de Investimento
            </TableHead>
            <TableHead className="dark:text-gray-300">Estratégia</TableHead>
            <TableHead className="dark:text-gray-300">Status</TableHead>
            <TableHead className="text-right dark:text-gray-300">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recomendacoes.map((record) => (
            <TableRow key={record.id} className="dark:border-gray-700">
              <TableCell className="font-medium dark:text-white">
                {record.title}
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {format(record.createdAt, "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Badge variant={getRiskProfileColor(record.riskProfile)}>
                  {record.riskProfile}
                </Badge>
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {record.investmentHorizon}
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {record.strategy}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusColor(record.status)}>
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="dark:text-white">
                      Ações
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onView(record.id)}
                      className="dark:text-gray-300 dark:hover:text-white dark:focus:text-white cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    {record.status === "Draft" && (
                      <DropdownMenuItem
                        onClick={() => onEdit(record.id)}
                        className="dark:text-gray-300 dark:hover:text-white dark:focus:text-white cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onExport(record.id)}
                      className="dark:text-gray-300 dark:hover:text-white dark:focus:text-white cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Exportar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="dark:border-gray-700" />
                    <DropdownMenuItem
                      onClick={() => onDelete(record.id)}
                      className="text-destructive focus:text-destructive dark:text-red-400 dark:focus:text-red-300 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryTable;
