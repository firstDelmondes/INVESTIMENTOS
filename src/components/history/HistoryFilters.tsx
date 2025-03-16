import React, { useState, useEffect } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/db";

interface HistoryFiltersProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
}

const HistoryFilters = ({
  onSearch = () => {},
  onFilterChange = () => {},
  onSortChange = () => {},
}: HistoryFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [hasRecommendations, setHasRecommendations] = useState(false);

  useEffect(() => {
    // Verificar se existem recomendações no banco de dados
    const checkRecommendations = async () => {
      try {
        const count = await db.recomendacoes.count();
        setHasRecommendations(count > 0);
      } catch (error) {
        console.error("Erro ao verificar recomendações:", error);
      }
    };

    checkRecommendations();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-md border shadow-sm dark:border-gray-700">
      <form onSubmit={handleSearch} className="flex w-full md:w-auto">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar por título ou cliente..."
            className="pl-8 w-full md:w-[300px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          className="ml-2 dark:text-gray-300"
        >
          Buscar
        </Button>
      </form>

      <div className="flex gap-2 w-full md:w-auto">
        <Select onValueChange={handleFilterChange} defaultValue={activeFilter}>
          <SelectTrigger className="w-[180px] dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar Por" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <SelectItem value="all">Todos os Perfis</SelectItem>
            <SelectItem value="conservative">Conservador</SelectItem>
            <SelectItem value="moderate">Moderado</SelectItem>
            <SelectItem value="aggressive">Agressivo</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full md:w-auto">
          <Select onValueChange={onSortChange}>
            <SelectTrigger className="dark:border-gray-600 dark:text-gray-300 dark:bg-gray-700">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar Por" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="date-desc">Mais Recentes</SelectItem>
              <SelectItem value="date-asc">Mais Antigos</SelectItem>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasRecommendations && (
        <div className="w-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 rounded-md mt-2">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            Nenhuma recomendação encontrada. Crie uma nova recomendação para
            começar.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryFilters;
