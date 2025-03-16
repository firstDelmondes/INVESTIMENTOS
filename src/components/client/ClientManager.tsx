import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { db } from "@/lib/db";
import { PlusCircle, Search, Edit, Trash2, FileText, User } from "lucide-react";

// Interface para o cliente
interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  dataNascimento?: string;
  cpf?: string;
  endereco?: string;
  observacoes?: string;
  dataCadastro: Date;
  ultimaAtualizacao: Date;
}

const ClientManager = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Cliente | null>(null);

  // Formulário de cliente
  const [formData, setFormData] = useState<Cliente>({
    nome: "",
    email: "",
    telefone: "",
    dataNascimento: "",
    cpf: "",
    endereco: "",
    observacoes: "",
    dataCadastro: new Date(),
    ultimaAtualizacao: new Date(),
  });

  // Carregar clientes do banco de dados
  useEffect(() => {
    const loadClientes = async () => {
      try {
        // Verificar se a tabela existe, se não, criá-la
        if (!db.table("clientes")) {
          await db.version(db.verno + 1).stores({
            clientes: "++id, nome, email, telefone, cpf, dataCadastro",
          });
        }

        // Carregar clientes
        const clientesData = await db.table("clientes").toArray();
        setClientes(clientesData);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar clientes",
          description: "Não foi possível carregar a lista de clientes.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClientes();
  }, [toast]);

  // Filtrar clientes com base no termo de busca
  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cliente.nome?.toLowerCase().includes(searchLower) ||
      cliente.email?.toLowerCase().includes(searchLower) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.cpf?.includes(searchTerm)
    );
  });

  // Manipular mudanças no formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      dataNascimento: "",
      cpf: "",
      endereco: "",
      observacoes: "",
      dataCadastro: new Date(),
      ultimaAtualizacao: new Date(),
    });
    setCurrentClient(null);
  };

  // Abrir formulário para edição
  const handleEdit = (cliente: Cliente) => {
    setCurrentClient(cliente);
    setFormData({
      ...cliente,
      ultimaAtualizacao: new Date(),
    });
    setIsDialogOpen(true);
  };

  // Salvar cliente
  const handleSave = async () => {
    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.email || !formData.telefone) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Nome, email e telefone são campos obrigatórios.",
        });
        return;
      }

      // Atualizar ou adicionar cliente
      if (currentClient?.id) {
        // Atualizar cliente existente
        await db.table("clientes").update(currentClient.id, {
          ...formData,
          ultimaAtualizacao: new Date(),
        });

        toast({
          title: "Cliente atualizado",
          description: `Os dados de ${formData.nome} foram atualizados com sucesso.`,
        });
      } else {
        // Adicionar novo cliente
        await db.table("clientes").add({
          ...formData,
          dataCadastro: new Date(),
          ultimaAtualizacao: new Date(),
        });

        toast({
          title: "Cliente adicionado",
          description: `${formData.nome} foi adicionado com sucesso.`,
        });
      }

      // Recarregar lista de clientes
      const updatedClientes = await db.table("clientes").toArray();
      setClientes(updatedClientes);

      // Fechar diálogo e resetar formulário
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar os dados do cliente.",
      });
    }
  };

  // Excluir cliente
  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await db.table("clientes").delete(id);

        // Atualizar lista de clientes
        const updatedClientes = await db.table("clientes").toArray();
        setClientes(updatedClientes);

        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir o cliente.",
        });
      }
    }
  };

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 p-6">
      <Card className="w-full h-full overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl dark:text-white">
                Gestão de Clientes
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Cadastre e gerencie seus clientes para facilitar a criação de
                recomendações
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="px-6 pb-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por nome, email, telefone ou CPF..."
                  className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="dark:bg-gray-700">
                  <TabsTrigger
                    value="todos"
                    className="dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="recentes"
                    className="dark:text-gray-300 dark:data-[state=active]:bg-gray-900"
                  >
                    Recentes
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ScrollArea className="flex-1 h-[calc(100%-60px)]">
            <div className="p-6">
              <TabsContent value="todos" className="m-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredClientes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="dark:text-gray-300">
                          Nome
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Email
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Telefone
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          CPF
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Data de Cadastro
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-right">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes.map((cliente) => (
                        <TableRow
                          key={cliente.id}
                          className="dark:border-gray-700"
                        >
                          <TableCell className="font-medium dark:text-white">
                            {cliente.nome}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cliente.email}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cliente.telefone}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {cliente.cpf}
                          </TableCell>
                          <TableCell className="dark:text-gray-300">
                            {new Date(
                              cliente.dataCadastro,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(cliente)}
                                className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  cliente.id && handleDelete(cliente.id)
                                }
                                className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-10 dark:text-gray-300">
                    <User className="h-10 w-10 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <h3 className="text-lg font-medium">
                      Nenhum cliente encontrado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      {searchTerm
                        ? "Tente ajustar sua busca ou cadastre um novo cliente."
                        : "Comece cadastrando seu primeiro cliente."}
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        resetForm();
                        setIsDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recentes" className="m-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="dark:text-gray-300">
                          Nome
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Email
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Telefone
                        </TableHead>
                        <TableHead className="dark:text-gray-300">
                          Data de Cadastro
                        </TableHead>
                        <TableHead className="dark:text-gray-300 text-right">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes
                        .sort(
                          (a, b) =>
                            new Date(b.dataCadastro).getTime() -
                            new Date(a.dataCadastro).getTime(),
                        )
                        .slice(0, 10)
                        .map((cliente) => (
                          <TableRow
                            key={cliente.id}
                            className="dark:border-gray-700"
                          >
                            <TableCell className="font-medium dark:text-white">
                              {cliente.nome}
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {cliente.email}
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {cliente.telefone}
                            </TableCell>
                            <TableCell className="dark:text-gray-300">
                              {new Date(
                                cliente.dataCadastro,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(cliente)}
                                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    cliente.id && handleDelete(cliente.id)
                                  }
                                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total de clientes: {clientes.length}
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de Formulário de Cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {currentClient ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              {currentClient
                ? "Atualize os dados do cliente no formulário abaixo."
                : "Preencha os dados do novo cliente no formulário abaixo."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="dark:text-gray-300">
                  Nome *
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone" className="dark:text-gray-300">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="dark:text-gray-300">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="dark:text-gray-300">
                  Data de Nascimento
                </Label>
                <Input
                  id="dataNascimento"
                  name="dataNascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="dark:text-gray-300">
                Endereço
              </Label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes" className="dark:text-gray-300">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                className="min-h-[100px] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="dark:border-gray-600 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {currentClient ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManager;
