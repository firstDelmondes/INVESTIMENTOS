import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Eye, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { db, Recomendacao } from "@/lib/db";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface RecentRecommendationsProps {
  recommendations?: Recomendacao[];
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onExport?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const RecentRecommendations = ({
  recommendations = [],
  onView = () => {},
  onEdit = () => {},
  onExport = () => {},
  onDelete = () => {},
}: RecentRecommendationsProps) => {
  const [recomendacoes, setRecomendacoes] =
    useState<Recomendacao[]>(recommendations);

  useEffect(() => {
    carregarRecomendacoes();
  }, []);

  const carregarRecomendacoes = async () => {
    try {
      // Busca as 5 recomendações mais recentes
      const recentes = await db.recomendacoes
        .orderBy("data")
        .reverse()
        .limit(5)
        .toArray();

      setRecomendacoes(recentes);
    } catch (error) {
      console.error("Erro ao carregar recomendações recentes:", error);
      setRecomendacoes([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await db.recomendacoes.delete(id);
      carregarRecomendacoes(); // Recarrega a lista após excluir
    } catch (error) {
      console.error("Erro ao excluir recomendação:", error);
    }
  };

  return (
    <div className="w-full rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recomendações Recentes</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/history">Ver Todas</Link>
        </Button>
      </div>

      <Table>
        <TableCaption>
          Uma lista das suas recomendações de investimento recentes.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Perfil de Risco</TableHead>
            <TableHead>Horizonte de Investimento</TableHead>
            <TableHead>Estratégia</TableHead>
            <TableHead className="text-right">Valor Investido</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recomendacoes.length > 0 ? (
            recomendacoes.map((recomendacao) => (
              <TableRow key={recomendacao.id}>
                <TableCell>
                  {format(new Date(recomendacao.data), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {recomendacao.titulo}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getRiskProfileBadgeColor(recomendacao.perfilRisco)}`}
                  >
                    {recomendacao.perfilRisco}
                  </span>
                </TableCell>
                <TableCell>{recomendacao.horizonteInvestimento}</TableCell>
                <TableCell>{recomendacao.estrategia}</TableCell>
                <TableCell className="font-medium text-right">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(recomendacao.valorInvestimento)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(recomendacao.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(recomendacao.id)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onExport(recomendacao.id)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Exportar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(recomendacao.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                Nenhuma recomendação encontrada. Crie sua primeira recomendação
                de alocação.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper function to get badge color based on risk profile
const getRiskProfileBadgeColor = (riskProfile: string): string => {
  switch (riskProfile.toLowerCase()) {
    case "conservador":
      return "bg-blue-100 text-blue-800";
    case "moderado":
      return "bg-yellow-100 text-yellow-800";
    case "agressivo":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default RecentRecommendations;
