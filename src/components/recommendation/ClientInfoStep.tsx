import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Coins, Calendar, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  clientName: z.string().min(3, {
    message: "O nome do cliente deve ter pelo menos 3 caracteres",
  }),
  clientAge: z.coerce
    .number()
    .min(18, {
      message: "A idade mínima para investimentos é 18 anos",
    })
    .max(120, {
      message: "Por favor, insira uma idade válida",
    }),
  investmentObjective: z.string({
    required_error: "Por favor, selecione um objetivo de investimento",
  }),
  investmentValue: z.coerce
    .number()
    .min(1000, {
      message: "O valor mínimo de investimento é R$ 1.000,00",
    })
    .max(100000000, {
      message: "O valor máximo de investimento é R$ 100.000.000,00",
    }),
});

type ClientInfoFormValues = z.infer<typeof formSchema>;

interface ClientInfoStepProps {
  onNext?: (data: ClientInfoFormValues) => void;
  initialValues?: {
    clientName: string;
    clientAge?: number;
    investmentObjective?: string;
    investmentValue: number;
  };
}

const investmentObjectives = [
  { value: "retirement", label: "Aposentadoria" },
  { value: "reserve", label: "Reserva de Emergência" },
  { value: "education", label: "Educação" },
  { value: "property", label: "Compra de Imóvel" },
  { value: "wealth", label: "Crescimento de Patrimônio" },
  { value: "income", label: "Geração de Renda" },
  { value: "travel", label: "Viagens" },
  { value: "other", label: "Outro Objetivo" },
];

const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  onNext = () => {},
  initialValues = {
    clientName: "",
    clientAge: 35,
    investmentObjective: "wealth",
    investmentValue: 100000,
  },
}) => {
  const form = useForm<ClientInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const handleSubmit = (data: ClientInfoFormValues) => {
    onNext(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Informações do Cliente
          </h1>
          <p className="text-gray-600 mt-2">
            Preencha os dados do cliente e o valor a ser investido
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados para Recomendação</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                          <div className="px-3 py-2 bg-gray-50 border-r rounded-l-md">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <Input
                            placeholder="Nome completo do cliente"
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Nome do cliente para quem a recomendação será feita
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade do Cliente</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                          <div className="px-3 py-2 bg-gray-50 border-r rounded-l-md">
                            <Calendar className="h-5 w-5 text-gray-500" />
                          </div>
                          <Input
                            type="number"
                            placeholder="Idade do cliente"
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        A idade do cliente é importante para determinar o
                        horizonte de investimento e o perfil de risco adequado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo do Investimento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                            <div className="px-3 py-2 bg-gray-50 border-r rounded-l-md">
                              <Target className="h-5 w-5 text-gray-500" />
                            </div>
                            <SelectTrigger className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1">
                              <SelectValue placeholder="Selecione o objetivo do investimento" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {investmentObjectives.map((objective) => (
                            <SelectItem
                              key={objective.value}
                              value={objective.value}
                            >
                              {objective.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        O objetivo do investimento ajuda a determinar a
                        estratégia mais adequada
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Investimento</FormLabel>
                      <FormControl>
                        <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                          <div className="px-3 py-2 bg-gray-50 border-r rounded-l-md">
                            <Coins className="h-5 w-5 text-gray-500" />
                          </div>
                          <Input
                            type="number"
                            placeholder="Valor a ser investido"
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            {...field}
                            onChange={(e) => {
                              const value =
                                e.target.value === "" ? "0" : e.target.value;
                              field.onChange(parseFloat(value));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        {field.value
                          ? `Valor formatado: ${formatCurrency(field.value)}`
                          : "Informe o valor total a ser investido"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit">Continuar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ClientInfoStep;
