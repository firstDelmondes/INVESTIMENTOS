import React, { useState } from "react";
import { FileText, Save, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportCustomization from "./ReportCustomization";
import ReportPreview from "./ReportPreview";

interface ReportGeneratorProps {
  recommendationData?: {
    riskProfile?: string;
    investmentHorizon?: string;
    allocationStrategy?: string;
    assetAllocation?: {
      name: string;
      percentage: number;
      color: string;
    }[];
  };
  onSave?: (reportData: any) => void;
  onCancel?: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  recommendationData = {
    riskProfile: "",
    investmentHorizon: "",
    allocationStrategy: "",
    assetAllocation: [],
  },

  onSave = () => {},
  onCancel = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("customize");
  const [reportData, setReportData] = useState({
    title: "Relatório de Alocação de Portfólio de Investimentos",
    description:
      "Alocação de investimentos personalizada com base no perfil de risco e horizonte de investimento do cliente",
    clientName: "",
    includeExecutiveSummary: true,
    includeMarketAnalysis: true,
    includeAssetAllocation: true,
    includePerformanceProjections: true,
    includeRiskAnalysis: true,
    includeRecommendations: true,
    reportFormat: "detailed",
    additionalNotes: "",
    ...recommendationData,
  });

  const handleCustomizationSubmit = (values: any) => {
    setReportData({ ...reportData, ...values });
    setActiveTab("preview");
  };

  const handleGenerateReport = () => {
    // In a real implementation, this would generate a PDF
    onSave(reportData);
  };

  return (
    <div className="w-full h-full bg-background p-4 md:p-6">
      <Card className="w-full h-full overflow-hidden flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Gerador de Relatórios</CardTitle>
              <CardDescription>
                Personalize e gere relatórios de recomendação de investimentos
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateReport}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Relatório
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
          >
            <div className="px-6 border-b">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="customize" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Personalizar Relatório
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Prévia do Relatório
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="customize" className="h-full m-0 p-0">
                <ReportCustomization
                  initialData={reportData}
                  onSubmit={handleCustomizationSubmit}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0 p-0">
                <ReportPreview
                  title={reportData.title}
                  description={reportData.description}
                  clientName={reportData.clientName}
                  riskProfile={reportData.riskProfile}
                  investmentHorizon={reportData.investmentHorizon}
                  allocationStrategy={reportData.allocationStrategy}
                  assetAllocation={reportData.assetAllocation}
                  onDownload={handleGenerateReport}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportGenerator;
