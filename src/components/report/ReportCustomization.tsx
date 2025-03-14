import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  clientName: z.string().min(2, { message: "Client name is required." }),
  includeExecutiveSummary: z.boolean().default(true),
  includeMarketAnalysis: z.boolean().default(true),
  includeAssetAllocation: z.boolean().default(true),
  includePerformanceProjections: z.boolean().default(true),
  includeRiskAnalysis: z.boolean().default(true),
  includeRecommendations: z.boolean().default(true),
  reportFormat: z.enum(["detailed", "summary", "presentation"]),
  additionalNotes: z.string().optional(),
});

type ReportCustomizationProps = {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
};

const ReportCustomization = ({
  onSubmit = () => {},
  initialData = {
    title: "Recomendação de Alocação de Investimentos",
    description:
      "Recomendação personalizada de alocação de investimentos com base no perfil de risco e horizonte de investimento do cliente.",
    clientName: "",
    includeExecutiveSummary: true,
    includeMarketAnalysis: true,
    includeAssetAllocation: true,
    includePerformanceProjections: true,
    includeRiskAnalysis: true,
    includeRecommendations: true,
    reportFormat: "detailed" as const,
    additionalNotes: "",
  },
}: ReportCustomizationProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg">
      <Card>
        <CardHeader>
          <CardTitle>Personalizar Relatório</CardTitle>
          <CardDescription>
            Configure os detalhes e seções a serem incluídos no seu relatório de
            recomendação de investimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Relatório</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o título do relatório"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Isto aparecerá como o título principal do seu relatório.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Client Name */}
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome do cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        O nome do cliente para quem este relatório é destinado.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Report Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Relatório</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite uma breve descrição deste relatório"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Um breve resumo que aparecerá na introdução do relatório.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Report Format */}
              <FormField
                control={form.control}
                name="reportFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato do Relatório</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um formato de relatório" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="detailed">
                          Relatório Detalhado
                        </SelectItem>
                        <SelectItem value="summary">
                          Relatório Resumido
                        </SelectItem>
                        <SelectItem value="presentation">
                          Formato de Apresentação
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Escolha o nível de detalhe e formato para o seu relatório.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sections to Include */}
              <div className="space-y-4">
                <Label className="text-base">Seções a Incluir</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-md p-4">
                  <FormField
                    control={form.control}
                    name="includeExecutiveSummary"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Resumo Executivo</FormLabel>
                          <FormDescription>
                            Breve visão geral das principais conclusões e
                            recomendações.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeMarketAnalysis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Análise de Mercado</FormLabel>
                          <FormDescription>
                            Condições atuais do mercado e perspectivas.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeAssetAllocation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Alocação de Ativos</FormLabel>
                          <FormDescription>
                            Detalhamento da alocação de ativos recomendada.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includePerformanceProjections"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Projeções de Desempenho</FormLabel>
                          <FormDescription>
                            Cenários e projeções de desempenho esperados.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeRiskAnalysis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Análise de Risco</FormLabel>
                          <FormDescription>
                            Avaliação de riscos potenciais e estratégias de
                            mitigação.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeRecommendations"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Recomendações</FormLabel>
                          <FormDescription>
                            Recomendações específicas de investimento e itens de
                            ação.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite quaisquer notas adicionais ou instruções especiais"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Quaisquer instruções especiais ou notas para este
                      relatório.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="px-0 pt-6 flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
                <Button type="submit">Salvar e Continuar</Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportCustomization;
