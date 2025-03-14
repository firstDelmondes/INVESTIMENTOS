import React from "react";
import { Search, Filter, Calendar, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerWithRange from "@/components/ui/date-picker-with-range";

interface HistoryFiltersProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onDateRangeChange?: (dateRange: any) => void;
  onSortChange?: (sortBy: string) => void;
}

const HistoryFilters = ({
  onSearch = () => {},
  onFilterChange = () => {},
  onDateRangeChange = () => {},
  onSortChange = () => {},
}: HistoryFiltersProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="w-full p-4 bg-white border rounded-md shadow-sm">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recomendações..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Risk Profile Filter */}
        <div className="w-full md:w-48">
          <Select onValueChange={onFilterChange}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Perfil de Risco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              <SelectItem value="conservative">Conservador</SelectItem>
              <SelectItem value="moderate">Moderado</SelectItem>
              <SelectItem value="aggressive">Agressivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="w-full md:w-auto">
          <DatePickerWithRange />
        </div>

        {/* Sort Button */}
        <div className="w-full md:w-auto">
          <Select onValueChange={onSortChange}>
            <SelectTrigger>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar Por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Mais Recentes</SelectItem>
              <SelectItem value="date-asc">Mais Antigos</SelectItem>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default HistoryFilters;
