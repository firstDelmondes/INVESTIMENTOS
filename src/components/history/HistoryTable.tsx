import React from "react";
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
    <div className="w-full bg-white rounded-md border shadow-sm">
      <Table>
        <TableCaption>
          Histórico de recomendações de alocação de investimentos
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Perfil de Risco</TableHead>
            <TableHead>Horizonte de Investimento</TableHead>
            <TableHead>Estratégia</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recommendations.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.title}</TableCell>
              <TableCell>{format(record.createdAt, "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Badge variant={getRiskProfileColor(record.riskProfile)}>
                  {record.riskProfile}
                </Badge>
              </TableCell>
              <TableCell>{record.investmentHorizon}</TableCell>
              <TableCell>{record.strategy}</TableCell>
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onView(record.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    {record.status === "Draft" && (
                      <DropdownMenuItem onClick={() => onEdit(record.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onExport(record.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Exportar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(record.id)}
                      className="text-destructive focus:text-destructive"
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
