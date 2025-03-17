import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Recomendacao } from "./db";

// Função para exportar uma recomendação como PDF
export const exportRecommendationToPDF = (
  recommendation: Recomendacao,
): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      // Ensure jsPDF is properly initialized
      if (typeof jsPDF !== "function") {
        console.error("jsPDF not properly initialized");
        resolve(false);
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Adicionar cabeçalho
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      const title =
        recommendation.titulo || "Relatório de Alocação de Investimentos";
      doc.text(title, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Adicionar data
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const date = new Date(recommendation.data).toLocaleDateString();
      doc.text(`Data: ${date}`, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Verificar se devemos incluir o resumo executivo
      if (recommendation.includeExecutiveSummary) {
        // Adicionar resumo executivo
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Resumo Executivo", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // Texto personalizado para o resumo executivo baseado no perfil e estratégia
        const resumoExecutivo = gerarResumoExecutivo(recommendation);
        const resumoLines = doc.splitTextToSize(resumoExecutivo, pageWidth - margin * 2);
        doc.text(resumoLines, margin, yPosition);
        yPosition += resumoLines.length * 5 + 10;
      }

      // Adicionar informações do cliente
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Informações do Cliente", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Nome: ${recommendation.nomeCliente || "Cliente"}`,
        margin,
        yPosition,
      );
      yPosition += 6;

      if (recommendation.idadeCliente) {
        doc.text(
          `Idade: ${recommendation.idadeCliente} anos`,
          margin,
          yPosition,
        );
        yPosition += 6;
      }

      doc.text(
        `Perfil de Risco: ${recommendation.perfilRisco || "Moderado"}`,
        margin,
        yPosition,
      );
      yPosition += 6;

      doc.text(
        `Horizonte de Investimento: ${recommendation.horizonteInvestimento || "5 anos (Médio Prazo)"}`,
        margin,
        yPosition,
      );
      yPosition += 6;

      doc.text(
        `Valor do Investimento: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(recommendation.valorInvestimento || 100000)}`,
        margin,
        yPosition,
      );
      yPosition += 15;

      // Verificar se devemos incluir análise de mercado
      if (recommendation.includeMarketAnalysis) {
        // Nova página para análise de mercado se necessário
        if (yPosition + 150 > pageHeight) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Análise de Mercado", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        // Texto personalizado para análise de mercado
        const analiseTexto = gerarAnaliseMercado(recommendation);
        const analiseLines = doc.splitTextToSize(analiseTexto, pageWidth - margin * 2);
        doc.text(analiseLines, margin, yPosition);
        yPosition += analiseLines.length * 5 + 10;
      }

      // Adicionar estratégia
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Estratégia de Investimento", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Estratégia: ${recommendation.estrategia || "Alocação Personalizada"}`,
        margin,
        yPosition,
      );
      yPosition += 10;

      // Adicionar descrição e princípios da estratégia
      yPosition = adicionarInformacoesEstrategia(
        doc,
        recommendation.estrategia || "",
        yPosition,
        margin,
        pageWidth,
        recommendation,
      );

      // Verificar se devemos incluir alocação de ativos
      if (recommendation.includeAssetAllocation) {
        // Nova página para alocação de ativos se necessário
        if (yPosition + 100 > pageHeight) {
          doc.addPage();
          yPosition = margin;
        }

        // Adicionar tabela de alocação de ativos
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Alocação de Ativos", margin, yPosition);
        yPosition += 10;

        // Criar tabela de alocação
        const defaultAlocacao = [
          { nome: "Ações", percentual: 40, cor: "#4f46e5" },
          { nome: "Renda Fixa", percentual: 30, cor: "#10b981" },
          { nome: "Alternativos", percentual: 10, cor: "#f59e0b" },
          { nome: "Criptomoedas", percentual: 15, cor: "#8884d8" },
          { nome: "Caixa", percentual: 5, cor: "#6b7280" },
        ];

        const alocacaoAtivos =
          recommendation.alocacaoAtivos?.length > 0
            ? recommendation.alocacaoAtivos
            : defaultAlocacao;

        const tableData = alocacaoAtivos.map((ativo) => [
          ativo.nome,
          `${ativo.percentual}%`,
          `${Math.max(0, ativo.percentual - 5)}% - ${Math.min(100, ativo.percentual + 5)}%`,
        ]);

        (doc as any).autoTable({
          startY: yPosition,
          head: [["Classe de Ativo", "Alocação", "Faixa Alvo"]],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          margin: { left: margin, right: margin },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;

        // Adicionar explicação detalhada da alocação
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const alocacaoExplicacao = gerarExplicacaoAlocacao(recommendation, alocacaoAtivos);
        const alocacaoLines = doc.splitTextToSize(alocacaoExplicacao, pageWidth - margin * 2);
        doc.text(alocacaoLines, margin, yPosition);
        yPosition += alocacaoLines.length * 5 + 10;
      }

      // Verificar se devemos incluir projeções de desempenho
      if (recommendation.includePerformanceProjections) {
        // Nova página para projeções se necessário
        if (yPosition + 100 > pageHeight) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Projeções de Desempenho", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Projeção de desempenho personalizada por estratégia, perfil e horizonte
        let performanceBase = "";
        let performanceAdicional = "";

        // Definir faixas de retorno base por perfil
        const retornoBase =
          recommendation.perfilRisco === "Conservador"
            ? "4-6%"
            : recommendation.perfilRisco === "Moderado"
              ? "6-8%"
              : "8-12%";

        // Ajustar projeção por estratégia
        if (recommendation.estrategia === "Portfólio Permanente") {
          performanceBase = `Projeção de retorno anualizado estimado para o Portfólio Permanente com perfil ${recommendation.perfilRisco}: ${retornoBase}`;
          performanceAdicional =
            "Esta estratégia historicamente apresenta menor volatilidade que o mercado geral, com desempenho mais estável em diferentes cenários econômicos, embora possa ter retornos inferiores em períodos prolongados de forte alta.";
        } else if (recommendation.estrategia === "Portfólio All Weather") {
          performanceBase = `Projeção de retorno anualizado estimado para o Portfólio All Weather com perfil ${recommendation.perfilRisco}: ${retornoBase}`;
          performanceAdicional =
            "Esta estratégia busca desempenho consistente em diferentes ambientes econômicos, com volatilidade tipicamente 30-40% menor que a de portfólios tradicionais, embora possa ter desempenho inferior em períodos de forte alta concentrada em uma única classe de ativos.";
        } else if (recommendation.estrategia === "Tradicional 60/40") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia Tradicional 60/40 com perfil ${recommendation.perfilRisco}: ${retornoBase}`;
          performanceAdicional =
            "Historicamente, esta estratégia apresentou retornos médios de 7-9% ao ano no longo prazo, com drawdowns máximos típicos de 20-30% em períodos de crise. A versão ajustada ao seu perfil de risco busca otimizar esta relação risco-retorno.";
        } else if (recommendation.estrategia === "Momentum e Rotação") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia de Momentum e Rotação com perfil ${recommendation.perfilRisco}: ${recommendation.perfilRisco === "Agressivo" ? "9-14%" : recommendation.perfilRisco === "Moderado" ? "7-10%" : "5-8%"}`;
          performanceAdicional =
            "Esta estratégia tática tem potencial de superar o mercado em períodos de tendências claras, mas pode apresentar maior volatilidade e custos de transação. O desempenho histórico mostra capacidade de reduzir perdas em mercados em queda através da rotação para ativos defensivos.";
        } else if (recommendation.estrategia === "Variância Mínima") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia de Variância Mínima com perfil ${recommendation.perfilRisco}: ${recommendation.perfilRisco === "Conservador" ? "3-5%" : recommendation.perfilRisco === "Moderado" ? "5-7%" : "6-9%"}`;
          performanceAdicional =
            "Esta estratégia prioriza a redução da volatilidade, historicamente apresentando drawdowns 30-50% menores que o mercado geral, com retornos potencialmente inferiores em mercados de forte alta, mas com melhor desempenho ajustado ao risco no longo prazo.";
        } else if (recommendation.estrategia === "Paridade de Risco") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia de Paridade de Risco com perfil ${recommendation.perfilRisco}: ${recommendation.perfilRisco === "Conservador" ? "4-6%" : recommendation.perfilRisco === "Moderado" ? "6-8%" : "7-10%"}`;
          performanceAdicional =
            "Esta estratégia busca equilibrar a contribuição de risco de cada classe de ativo, resultando em uma carteira mais robusta em diferentes cenários econômicos. Historicamente, apresenta menor volatilidade que portfólios tradicionais com retornos competitivos ajustados ao risco.";
        } else if (recommendation.estrategia === "Black-Litterman") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia Black-Litterman com perfil ${recommendation.perfilRisco}: ${recommendation.perfilRisco === "Conservador" ? "4-6%" : recommendation.perfilRisco === "Moderado" ? "6-9%" : "8-12%"}`;
          performanceAdicional =
            "Esta abordagem sofisticada combina o equilíbrio de mercado com visões específicas sobre classes de ativos, resultando em alocações mais intuitivas e estáveis. O modelo permite incorporar expectativas personalizadas sobre o desempenho futuro dos mercados.";
        } else if (recommendation.estrategia === "Pesos Iguais") {
          performanceBase = `Projeção de retorno anualizado estimado para a estratégia de Pesos Iguais com perfil ${recommendation.perfilRisco}: ${recommendation.perfilRisco === "Conservador" ? "3-5%" : recommendation.perfilRisco === "Moderado" ? "5-7%" : "7-9%"}`;
          performanceAdicional =
            "Esta estratégia simples e transparente historicamente apresenta desempenho surpreendentemente robusto, evitando erros de estimativa e concentração excessiva. O rebalanceamento regular captura naturalmente o efeito de 'comprar na baixa e vender na alta'.";
        } else {
          performanceBase = `Projeção de retorno anualizado estimado para os próximos anos com seu perfil ${recommendation.perfilRisco}: ${retornoBase}`;
          performanceAdicional = "Esta estratégia personalizada foi desenhada especificamente para atender suas necessidades e objetivos financeiros, considerando seu perfil de risco e horizonte de investimento.";
        }

        // Ajustar por horizonte de investimento
        const perfHorizMatch =
          recommendation.horizonteInvestimento?.match(/(\d+)\s*anos/);
        const perfHorizYears = perfHorizMatch ? parseInt(perfHorizMatch[1]) : 5;

        if (perfHorizYears >= 10) {
          // Longo prazo
          performanceAdicional += ` Com seu horizonte de ${perfHorizYears} anos, a probabilidade de atingir retornos dentro ou acima da faixa projetada aumenta significativamente, permitindo capturar múltiplos ciclos de mercado e reduzir o impacto da volatilidade de curto prazo.`;
        } else if (perfHorizYears <= 3) {
          // Curto prazo
          performanceAdicional += ` Considerando seu horizonte de apenas ${perfHorizYears} anos, a volatilidade de curto prazo pode impactar significativamente os resultados, com maior dispersão possível em torno da projeção base.`;
        }

        const perform
