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

      // Adicionar tabela de alocação de ativos
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Alocação de Ativos", margin, yPosition);
      yPosition += 10;

      // Verificar se há espaço suficiente para a tabela, caso contrário, adicionar nova página
      if (
        yPosition + (recommendation.alocacaoAtivos?.length || 0) * 10 + 20 >
        pageHeight
      ) {
        doc.addPage();
        yPosition = margin;
      }

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

      // Adicionar informações adicionais
      if (yPosition + 100 > pageHeight) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Informações Adicionais", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Considerações sobre rebalanceamento personalizadas por estratégia e perfil
      doc.setFont("helvetica", "bold");
      doc.text("Considerações sobre Rebalanceamento:", margin, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");

      // Texto personalizado sobre rebalanceamento
      let rebalanceText = "";

      if (recommendation.estrategia === "Portfólio Permanente") {
        rebalanceText =
          "Para o Portfólio Permanente, recomendamos um rebalanceamento anual, ou quando qualquer classe de ativo desviar mais de 10% de sua alocação alvo. Esta frequência reduzida é uma característica fundamental desta estratégia, permitindo que os ativos se movimentem naturalmente em diferentes ciclos econômicos.";
      } else if (recommendation.estrategia === "Momentum e Rotação") {
        rebalanceText =
          "Para sua estratégia de Momentum e Rotação, recomendamos uma revisão mensal das tendências de mercado, com rotações táticas a cada 1-3 meses dependendo da força dos sinais de momentum. Estabeleça critérios claros de entrada e saída baseados em indicadores técnicos como médias móveis, força relativa e volume.";
      } else if (recommendation.estrategia === "Tradicional 60/40") {
        rebalanceText =
          "Para a estratégia Tradicional 60/40, recomendamos revisar e rebalancear trimestralmente, ou quando a proporção entre ações e renda fixa desviar mais de 5% da alocação alvo (por exemplo, se ações ultrapassarem 65% ou caírem abaixo de 55%). Este rebalanceamento disciplinado ajuda a capturar ganhos em ativos valorizados e comprar ativos a preços mais baixos.";
      } else {
        // Personalização por perfil de risco
        if (recommendation.perfilRisco === "Conservador") {
          rebalanceText =
            "Considerando seu perfil conservador, recomendamos revisar e rebalancear esta alocação trimestralmente, ou quando houver desvios superiores a 3-5% em relação às alocações alvo. Este rebalanceamento mais frequente ajuda a controlar o risco e manter a estabilidade desejada em sua carteira.";
        } else if (recommendation.perfilRisco === "Moderado") {
          rebalanceText =
            "Para seu perfil moderado, recomendamos revisar e rebalancear esta alocação semestralmente, ou quando houver desvios superiores a 5-7% em relação às alocações alvo. O rebalanceamento ajuda a manter o nível de risco desejado e pode melhorar os retornos de longo prazo através da compra sistemática de ativos a preços mais baixos.";
        } else {
          // Agressivo
          rebalanceText =
            "Com seu perfil agressivo, recomendamos revisar a alocação trimestralmente, mas rebalancear apenas quando houver desvios superiores a 7-10% em relação às alocações alvo. Esta abordagem permite capturar tendências de mercado enquanto mantém a disciplina de investimento, sem incorrer em custos excessivos de transação.";
        }
      }

      // Adicionar consideração sobre horizonte de investimento
      const anosMatch =
        recommendation.horizonteInvestimento?.match(/(\d+)\s*anos/);
      const anos = anosMatch ? parseInt(anosMatch[1]) : 5;

      if (anos <= 3) {
        // Curto prazo
        rebalanceText +=
          " Considerando seu horizonte de curto prazo, o rebalanceamento também deve considerar a proximidade do seu objetivo financeiro, aumentando gradualmente a alocação em ativos mais estáveis à medida que se aproxima da data-alvo.";
      }

      const rebalanceLines = doc.splitTextToSize(
        rebalanceText,
        pageWidth - margin * 2,
      );
      doc.text(rebalanceLines, margin, yPosition);
      yPosition += rebalanceLines.length * 5 + 5;

      // Diversificação interna
      doc.setFont("helvetica", "bold");
      doc.text("Diversificação Interna:", margin, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");

      // Texto de diversificação personalizado por perfil de risco e estratégia
      let diversificationText = "";

      if (recommendation.perfilRisco === "Agressivo") {
        if (alocacaoAtivos.some((ativo) => ativo.nome.includes("Cripto"))) {
          if (
            recommendation.estrategia === "Portfólio All Weather" ||
            recommendation.estrategia === "Portfólio Permanente"
          ) {
            diversificationText = `Dentro de cada classe de ativo, recomendamos diversificar estrategicamente. Para a classe de criptoativos em sua estratégia ${recommendation.estrategia}, considere uma alocação de Bitcoin (50-60%) como reserva de valor digital, Ethereum (25-30%) para exposição ao ecossistema de contratos inteligentes, e o restante dividido entre altcoins estabelecidas (10-15%) e stablecoins (5-10%) para estabilidade. Esta distribuição complementa o equilíbrio entre proteção e crescimento característico desta estratégia.`;
          } else if (recommendation.estrategia === "Momentum e Rotação") {
            diversificationText = `Para maximizar os benefícios da estratégia de Momentum e Rotação com seu perfil agressivo, recomendamos uma abordagem dinâmica para criptomoedas: 40-50% em Bitcoin, 20-30% em Ethereum, e 20-40% rotacionando entre altcoins com forte momentum técnico. Estabeleça critérios claros de entrada e saída baseados em indicadores de força relativa e volume, reavaliando posições a cada 30-45 dias para capturar tendências emergentes no mercado cripto.`;
          } else {
            diversificationText = `Dentro de cada classe de ativo, recomendamos diversificar entre diferentes instrumentos. Para a classe de criptoativos, considere uma alocação entre Bitcoin (60%), Ethereum (30%) e outras criptomoedas estabelecidas (10%), alinhada ao seu perfil de risco agressivo e à estratégia ${recommendation.estrategia}. Estabeleça limites máximos de exposição e um cronograma regular de rebalanceamento para gerenciar a volatilidade.`;
          }
        } else {
          diversificationText = `Para seu perfil agressivo com a estratégia ${recommendation.estrategia}, recomendamos diversificar suas ações com: 40-50% em ações de crescimento de setores inovadores (tecnologia, saúde, energia limpa), 20-30% em mercados emergentes com alto potencial, 15-20% em small caps com vantagens competitivas, e 10-15% em ações de valor estabelecidas para estabilidade. Na renda fixa, priorize títulos corporativos de maior rendimento e títulos indexados à inflação para proteção.`;
        }
      } else if (recommendation.perfilRisco === "Moderado") {
        if (recommendation.estrategia === "Tradicional 60/40") {
          diversificationText = `Para otimizar sua estratégia Tradicional 60/40 com perfil moderado, recomendamos diversificar o componente de ações (60%) com: 50-60% em ações de grandes empresas divididas entre crescimento e valor, 20-25% em ações internacionais de mercados desenvolvidos, 10-15% em mercados emergentes, e 5-10% em small caps. Para o componente de renda fixa (40%), sugerimos: 50-60% em títulos governamentais de médio prazo, 25-30% em títulos corporativos de alta qualidade, e 10-15% em títulos indexados à inflação.`;
        } else if (recommendation.estrategia === "Portfólio All Weather") {
          diversificationText = `Para maximizar a eficácia do Portfólio All Weather com seu perfil moderado, recomendamos diversificar cada componente estrategicamente: nas ações (30%), divida entre grandes empresas domésticas (60%), internacionais (30%) e emergentes (10%); nos títulos de longo prazo (40%), combine títulos governamentais (70%) e corporativos de alta qualidade (30%); nas commodities (15%), inclua ouro (60%), metais industriais (20%) e energia (20%); e mantenha o componente de caixa (15%) em instrumentos de alta liquidez e baixo risco.`;
        } else {
          diversificationText = `Para seu perfil moderado com a estratégia ${recommendation.estrategia}, recomendamos diversificar suas ações entre empresas de grande capitalização (60%), médio porte (25%) e internacionais (15%), abrangendo setores defensivos e de crescimento. Na renda fixa, combine títulos governamentais (50%), corporativos de alta qualidade (30%) e indexados à inflação (20%) com diferentes vencimentos. Para ativos alternativos, considere fundos imobiliários diversificados por segmento e região.`;
        }
      } else {
        // Conservador
        if (recommendation.estrategia === "Variância Mínima") {
          diversificationText = `Para otimizar sua estratégia de Variância Mínima com perfil conservador, recomendamos diversificar com precisão: nas ações (20-25%), priorize empresas de baixa volatilidade com dividendos consistentes, utilities e setores defensivos; na renda fixa (60-70%), combine títulos governamentais de curto e médio prazo (60%), títulos corporativos AAA/AA (30%) e títulos indexados à inflação (10%); e mantenha uma posição em caixa (10-15%) em instrumentos de alta liquidez. Esta estrutura é especialmente projetada para minimizar oscilações enquanto preserva seu capital.`;
        } else {
          diversificationText = `Para seu perfil conservador com a estratégia ${recommendation.estrategia}, recomendamos diversificar sua renda fixa entre títulos governamentais de curto e médio prazo (50%), CDBs de bancos de primeira linha (30%) e títulos indexados à inflação (20%). Para a parcela em ações, priorize empresas consolidadas com histórico de dividendos consistentes, baixa volatilidade e setores defensivos como consumo básico, utilities e saúde. Mantenha uma reserva estratégica em instrumentos de alta liquidez para oportunidades e emergências.`;
        }
      }

      const diversificationLines = doc.splitTextToSize(
        diversificationText,
        pageWidth - margin * 2,
      );
      doc.text(diversificationLines, margin, yPosition);
      yPosition += diversificationLines.length * 5 + 5;

      // Fatores de risco
      doc.setFont("helvetica", "bold");
      doc.text("Fatores de Risco:", margin, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");

      // Fatores de risco personalizados por estratégia, perfil e horizonte
      let riskFactors = [
        "• Mudanças nas condições macroeconômicas podem afetar o desempenho relativo das classes de ativos",
      ];

      // Adicionar fatores de risco específicos por estratégia
      if (recommendation.estrategia === "Portfólio Permanente") {
        riskFactors.push(
          "• Períodos prolongados de estabilidade econômica podem resultar em desempenho inferior ao de estratégias mais concentradas",
        );
        riskFactors.push(
          "• A alocação fixa em ouro pode ser um lastro em períodos de forte crescimento econômico",
        );
      } else if (recommendation.estrategia === "Portfólio All Weather") {
        riskFactors.push(
          "• Cenários econômicos sem precedentes históricos podem afetar todas as classes de ativos simultaneamente",
        );
        riskFactors.push(
          "• A correlação entre ativos pode aumentar em períodos de estresse de mercado, reduzindo os benefícios da diversificação",
        );
      } else if (recommendation.estrategia === "Tradicional 60/40") {
        riskFactors.push(
          "• Períodos de alta inflação podem afetar negativamente tanto ações quanto títulos simultaneamente",
        );
        riskFactors.push(
          "• Concentração em apenas duas grandes classes de ativos limita a diversificação em cenários adversos específicos",
        );
      } else if (recommendation.estrategia === "Momentum e Rotação") {
        riskFactors.push(
          "• Reversões rápidas de tendência podem resultar em perdas antes que os sinais de rotação sejam acionados",
        );
        riskFactors.push(
          "• Custos de transação mais elevados devido à maior frequência de rebalanceamento",
        );
      } else if (recommendation.estrategia === "Variância Mínima") {
        riskFactors.push(
          "• Potencial de retornos inferiores em mercados de forte alta devido à menor exposição a ativos de crescimento",
        );
        riskFactors.push(
          "• Risco de que correlações históricas entre ativos mudem em períodos de estresse de mercado",
        );
      }

      // Adicionar fatores específicos por perfil de risco e classes de ativos
      if (recommendation.perfilRisco === "Agressivo") {
        riskFactors.push(
          "• Maior volatilidade de curto prazo, com possibilidade de drawdowns significativos",
        );

        if (alocacaoAtivos.some((ativo) => ativo.nome.includes("Cripto"))) {
          riskFactors.push(
            "• Criptomoedas apresentam volatilidade extrema e podem sofrer quedas superiores a 50% em curtos períodos",
          );
          riskFactors.push(
            "• Regulamentações governamentais podem impactar significativamente o mercado de criptoativos",
          );
          riskFactors.push(
            "• Riscos tecnológicos específicos: vulnerabilidades em protocolos, ataques a exchanges, falhas em smart contracts",
          );
          riskFactors.push(
            "• Menor liquidez em algumas criptomoedas pode amplificar movimentos de preço em períodos de estresse",
          );
        }

        if (alocacaoAtivos.some((ativo) => ativo.nome.includes("Ações"))) {
          riskFactors.push(
            "• Maior exposição a ações de crescimento e mercados emergentes aumenta a sensibilidade a ciclos econômicos",
          );
        }
      } else if (recommendation.perfilRisco === "Moderado") {
        riskFactors.push(
          "• Volatilidade moderada, com possibilidade de períodos temporários de retornos negativos",
        );
        riskFactors.push(
          "• Mudanças nas taxas de juros podem afetar simultaneamente o desempenho das ações e da renda fixa",
        );

        if (
          alocacaoAtivos.some((ativo) => ativo.nome.includes("Alternativos"))
        ) {
          riskFactors.push(
            "• Ativos alternativos podem apresentar menor liquidez em períodos de estresse de mercado",
          );
        }
      } else {
        // Conservador
        riskFactors.push(
          "• Mesmo com perfil conservador, retornos podem ficar abaixo da inflação em certos períodos",
        );
        riskFactors.push(
          "• Concentração em renda fixa aumenta a sensibilidade a mudanças nas taxas de juros",
        );
        riskFactors.push(
          "• Exposição insuficiente a ativos de crescimento pode comprometer objetivos de longo prazo",
        );
      }

      // Adicionar fatores específicos por horizonte de investimento
      const anosMatch =
        recommendation.horizonteInvestimento?.match(/(\d+)\s*anos/);
      const anos = anosMatch ? parseInt(anosMatch[1]) : 5;

      if (anos <= 3) {
        // Curto prazo
        riskFactors.push(
          "• Horizonte curto limita a capacidade de recuperação após quedas de mercado",
        );
        riskFactors.push(
          "• Necessidade de liquidez pode forçar vendas em momentos desfavoráveis de mercado",
        );
      } else if (anos >= 10) {
        // Longo prazo
        riskFactors.push(
          "• Mudanças significativas no cenário econômico global ao longo de décadas",
        );
        riskFactors.push(
          "• Risco de obsolescência de setores e empresas em horizontes muito longos",
        );
      }

      // Adicionar fatores específicos por objetivo
      if (recommendation.objetivoInvestimento === "retirement") {
        riskFactors.push(
          "• Risco de longevidade: possibilidade de que os recursos não sejam suficientes para todo o período de aposentadoria",
        );
      } else if (recommendation.objetivoInvestimento === "education") {
        riskFactors.push(
          "• Aumento dos custos educacionais acima da inflação geral pode exigir retornos mais elevados",
        );
      }

      riskFactors.forEach((factor) => {
        doc.text(factor, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;

      // Adicionar projeção de desempenho
      if (yPosition + 40 > pageHeight) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont("helvetica", "bold");
      doc.text("Projeção de Desempenho:", margin, yPosition);
      yPosition += 6;
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
      } else {
        performanceBase = `Projeção de retorno anualizado estimado para os próximos anos com seu perfil ${recommendation.perfilRisco}: ${retornoBase}`;
      }

      // Ajustar por horizonte de investimento
      const anosMatch =
        recommendation.horizonteInvestimento?.match(/(\d+)\s*anos/);
      const anos = anosMatch ? parseInt(anosMatch[1]) : 5;

      if (anos >= 10) {
        // Longo prazo
        performanceAdicional += ` Com seu horizonte de ${anos} anos, a probabilidade de atingir retornos dentro ou acima da faixa projetada aumenta significativamente, permitindo capturar múltiplos ciclos de mercado e reduzir o impacto da volatilidade de curto prazo.`;
      } else if (anos <= 3) {
        // Curto prazo
        performanceAdicional += ` Considerando seu horizonte de apenas ${anos} anos, a volatilidade de curto prazo pode impactar significativamente os resultados, com maior dispersão possível em torno da projeção base.`;
      }

      const performanceText = `${performanceBase} (considerando cenário base de mercado). ${performanceAdicional}`;

      const performanceLines = doc.splitTextToSize(
        performanceText,
        pageWidth - margin * 2,
      );
      doc.text(performanceLines, margin, yPosition);
      yPosition += performanceLines.length * 5 + 5;

      // Verificar se precisa de nova página para o rodapé
      if (yPosition + 20 > pageHeight) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      // Disclaimer personalizado com base no perfil e estratégia
      let disclaimer =
        "Este relatório é apenas para fins informativos e não constitui aconselhamento de investimento. " +
        "Os valores e projeções apresentados são baseados em dados históricos e não garantem resultados futuros. " +
        "Consulte um profissional financeiro antes de tomar decisões de investimento.";

      // Adicionar avisos específicos para perfil agressivo com criptomoedas
      if (
        recommendation.perfilRisco === "Agressivo" &&
        alocacaoAtivos.some((ativo) => ativo.nome.includes("Cripto"))
      ) {
        disclaimer +=
          " Investimentos em criptomoedas envolvem riscos substanciais, incluindo perda total do capital. " +
          "A alta volatilidade, riscos regulatórios e tecnológicos tornam estes ativos adequados apenas para investidores com alta tolerância a risco e como parte limitada de um portfólio diversificado.";
      }

      // Adicionar avisos específicos para estratégias mais complexas
      if (
        recommendation.estrategia === "Black-Litterman" ||
        recommendation.estrategia === "Otimização de Markowitz" ||
        recommendation.estrategia === "Paridade de Risco"
      ) {
        disclaimer +=
          " A estratégia utilizada neste relatório emprega modelos quantitativos complexos que dependem de premissas estatísticas e dados históricos, " +
          "podendo não capturar adequadamente eventos extremos ou mudanças estruturais nos mercados.";
      }

      const disclaimerLines = doc.splitTextToSize(
        disclaimer,
        pageWidth - margin * 2,
      );
      doc.text(disclaimerLines, margin, pageHeight - 20);

      // Salvar o PDF com tratamento de erro
      try {
        const clientName = recommendation.nomeCliente || "cliente";
        const fileName = `relatorio_investimento_${clientName.replace(/\s+/g, "_")}_${date.replace(/\//g, "-")}.pdf`;
        doc.save(fileName);
        console.log(`PDF salvo com sucesso: ${fileName}`);
        resolve(true);
      } catch (saveError) {
        console.error("Erro ao salvar o arquivo PDF:", saveError);
        resolve(false);
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      resolve(false);
    }
  });
};

// Função para exportar múltiplas recomendações como PDF
export const exportHistoryToPDF = (recommendations: Recomendacao[]) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Adicionar cabeçalho
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = "Histórico de Recomendações de Investimentos";
    doc.text(title, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Adicionar data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const date = new Date().toLocaleDateString();
    doc.text(`Gerado em: ${date}`, pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    // Criar tabela de recomendações
    const tableData =
      recommendations.length > 0
        ? recommendations.map((rec) => [
            rec.titulo || "Sem título",
            new Date(rec.data).toLocaleDateString(),
            rec.perfilRisco || "Não definido",
            rec.horizonteInvestimento || "Não definido",
            rec.estrategia || "Não definida",
            rec.status || "Rascunho",
          ])
        : [["Nenhuma recomendação encontrada", "", "", "", "", ""]];

    (doc as any).autoTable({
      startY: yPosition,
      head: [
        [
          "Título",
          "Data",
          "Perfil de Risco",
          "Horizonte",
          "Estratégia",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: margin, right: margin },
    });

    // Adicionar resumo estatístico
    if (recommendations.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY;
      yPosition = finalY + 20;

      // Verificar se há espaço suficiente para o resumo, caso contrário, adicionar nova página
      if (yPosition + 60 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Estatístico", margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Contar perfis de risco
      const perfilCount = {
        Conservador: 0,
        Moderado: 0,
        Agressivo: 0,
      };

      recommendations.forEach((rec) => {
        if (rec.perfilRisco === "Conservador") perfilCount.Conservador++;
        else if (rec.perfilRisco === "Moderado") perfilCount.Moderado++;
        else if (rec.perfilRisco === "Agressivo") perfilCount.Agressivo++;
      });

      doc.text(
        `Total de recomendações: ${recommendations.length}`,
        margin,
        yPosition,
      );
      yPosition += 6;
      doc.text(
        `Perfil Conservador: ${perfilCount.Conservador} (${Math.round((perfilCount.Conservador / recommendations.length) * 100)}%)`,
        margin,
        yPosition,
      );
      yPosition += 6;
      doc.text(
        `Perfil Moderado: ${perfilCount.Moderado} (${Math.round((perfilCount.Moderado / recommendations.length) * 100)}%)`,
        margin,
        yPosition,
      );
      yPosition += 6;
      doc.text(
        `Perfil Agressivo: ${perfilCount.Agressivo} (${Math.round((perfilCount.Agressivo / recommendations.length) * 100)}%)`,
        margin,
        yPosition,
      );
    }

    // Salvar o PDF
    doc.save(`historico_recomendacoes_${date.replace(/\//g, "-")}.pdf`);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF de histórico:", error);
    return false;
  }
};

// Função auxiliar para obter descrição da estratégia personalizada por perfil de risco
const getEstrategiaDescricao = (
  estrategia: string,
  perfilRisco: string = "Moderado",
  horizonteInvestimento: string = "5 anos",
  objetivo: string = "wealth",
): string => {
  // Descrições base por estratégia
  const descricoesBase: Record<string, string> = {
    "Portfólio Permanente":
      "O Portfólio Permanente é uma estratégia de investimento que busca manter o valor do capital em diferentes cenários econômicos.",
    "Portfólio All Weather":
      "O Portfólio All Weather é uma estratégia desenvolvida para ter bom desempenho em qualquer ambiente econômico, equilibrando exposições a crescimento, inflação, deflação e recessão.",
    "Tradicional 60/40":
      "A estratégia Tradicional 60/40 aloca 60% dos investimentos em ações e 40% em títulos de renda fixa, buscando equilibrar crescimento e estabilidade.",
    "Otimização de Markowitz":
      "Baseada na Teoria Moderna do Portfólio, a Otimização de Markowitz busca maximizar o retorno esperado para um determinado nível de risco.",
    "Paridade de Risco":
      "A estratégia de Paridade de Risco aloca os investimentos de forma que cada classe de ativos contribua igualmente para o risco total do portfólio.",
    "Black-Litterman":
      "O modelo Black-Litterman combina as visões do investidor sobre o mercado com o equilíbrio de mercado para criar alocações personalizadas.",
    "Pesos Iguais":
      "A estratégia de Pesos Iguais distribui o capital uniformemente entre todas as classes de ativos disponíveis.",
    "Momentum e Rotação":
      "Esta estratégia investe em ativos que demonstraram forte desempenho recente (momentum) e realiza rotações periódicas entre classes de ativos.",
    "Variância Mínima":
      "A estratégia de Variância Mínima busca criar um portfólio com a menor volatilidade possível, independentemente do retorno esperado.",
    "Alocação Personalizada":
      "Esta estratégia foi personalizada especificamente para seu perfil de risco, horizonte de investimento e objetivos financeiros.",
  };

  // Obter a descrição base da estratégia
  let descricaoBase =
    descricoesBase[estrategia] ||
    "Estratégia personalizada baseada no seu perfil de risco e horizonte de investimento.";

  // Adicionar detalhes específicos por perfil de risco
  let detalhesPerfilRisco = "";
  if (perfilRisco === "Conservador") {
    switch (estrategia) {
      case "Portfólio Permanente":
        detalhesPerfilRisco =
          " Para seu perfil conservador, a implementação enfatiza a proteção do capital com uma alocação equilibrada entre ações de baixa volatilidade, títulos de alta qualidade, ouro e caixa, reduzindo a exposição a ativos de maior risco.";
        break;
      case "Portfólio All Weather":
        detalhesPerfilRisco =
          " Adaptada ao seu perfil conservador, esta versão prioriza títulos de renda fixa de alta qualidade e proteção contra inflação, com exposição moderada a ações de dividendos e menor alocação em commodities.";
        break;
      case "Tradicional 60/40":
        detalhesPerfilRisco =
          " Para seu perfil conservador, ajustamos a alocação tradicional para 40/60 (ações/renda fixa), priorizando ações de empresas estabelecidas com dividendos consistentes e títulos de alta qualidade.";
        break;
      case "Variância Mínima":
        detalhesPerfilRisco =
          " Esta estratégia é particularmente adequada ao seu perfil conservador, pois foca em minimizar a volatilidade total da carteira, priorizando ativos estáveis e de baixo risco.";
        break;
      default:
        detalhesPerfilRisco =
          " Para seu perfil conservador, a implementação prioriza a preservação de capital e a geração de renda estável, com foco em ativos de menor volatilidade e maior previsibilidade.";
    }
  } else if (perfilRisco === "Moderado") {
    switch (estrategia) {
      case "Portfólio Permanente":
        detalhesPerfilRisco =
          " Para seu perfil moderado, mantemos a divisão clássica entre ações, títulos de longo prazo, ouro e caixa, com pequenos ajustes para capturar oportunidades de crescimento sem comprometer a estabilidade.";
        break;
      case "Portfólio All Weather":
        detalhesPerfilRisco =
          " Alinhada ao seu perfil moderado, esta implementação equilibra crescimento e proteção, com alocações balanceadas entre ações diversificadas, títulos de diferentes prazos, commodities e uma reserva estratégica em caixa.";
        break;
      case "Tradicional 60/40":
        detalhesPerfilRisco =
          " Mantendo a proporção clássica de 60% em ações e 40% em renda fixa, esta implementação é ideal para seu perfil moderado, oferecendo um equilíbrio entre potencial de valorização e estabilidade.";
        break;
      case "Black-Litterman":
        detalhesPerfilRisco =
          " Para seu perfil moderado, esta abordagem sofisticada permite incorporar visões de mercado equilibradas, ajustando as alocações para refletir um balanço entre oportunidades de crescimento e controle de risco.";
        break;
      default:
        detalhesPerfilRisco =
          " Para seu perfil moderado, a implementação busca um equilíbrio entre crescimento e preservação de capital, com diversificação entre diferentes classes de ativos e setores econômicos.";
    }
  } else {
    // Agressivo
    switch (estrategia) {
      case "Portfólio Permanente":
        detalhesPerfilRisco =
          " Adaptada ao seu perfil agressivo, esta versão mantém a estrutura básica do Portfólio Permanente, mas incorpora uma alocação adicional em criptomoedas e ações de maior crescimento, aumentando o potencial de retorno.";
        break;
      case "Portfólio All Weather":
        detalhesPerfilRisco =
          " Para seu perfil agressivo, esta implementação aumenta a exposição a ações de crescimento e mercados emergentes, inclui alocação em criptomoedas como hedge contra inflação, e reduz a proporção em ativos defensivos.";
        break;
      case "Tradicional 60/40":
        detalhesPerfilRisco =
          " Adaptada ao seu perfil agressivo, esta versão amplia a alocação em ações para 70-80%, com foco em setores de crescimento e mercados emergentes, e inclui exposição a criptomoedas e ativos alternativos.";
        break;
      case "Momentum e Rotação":
        detalhesPerfilRisco =
          " Esta estratégia dinâmica é particularmente adequada ao seu perfil agressivo, permitindo capturar tendências de mercado com rotações táticas entre classes de ativos, incluindo criptomoedas e setores de alto crescimento.";
        break;
      default:
        detalhesPerfilRisco =
          " Para seu perfil agressivo, a implementação maximiza o potencial de crescimento com maior exposição a ativos de alto retorno, incluindo ações de crescimento, mercados emergentes, criptomoedas e investimentos alternativos.";
    }
  }

  // Adicionar detalhes específicos por horizonte de investimento
  let detalhesHorizonte = "";
  const anosMatch = horizonteInvestimento.match(/(\d+)\s*anos/);
  const anos = anosMatch ? parseInt(anosMatch[1]) : 5;

  if (anos <= 3) {
    // Curto prazo
    detalhesHorizonte = ` Considerando seu horizonte de investimento de curto prazo (${anos} anos), a estratégia foi ajustada para priorizar liquidez e preservação de capital, com menor exposição a ativos de longo prazo e maior alocação em instrumentos de menor volatilidade.`;
  } else if (anos >= 10) {
    // Longo prazo
    detalhesHorizonte = ` Com seu horizonte de investimento de longo prazo (${anos} anos), a estratégia aproveita o poder dos juros compostos e a capacidade de suportar volatilidade temporária, permitindo maior exposição a ativos de crescimento e menor preocupação com flutuações de curto prazo.`;
  } else {
    // Médio prazo
    detalhesHorizonte = ` Para seu horizonte de investimento de médio prazo (${anos} anos), a estratégia equilibra oportunidades de crescimento com necessidade de estabilidade, permitindo exposição moderada a ativos de maior risco enquanto mantém uma base sólida em investimentos mais estáveis.`;
  }

  // Adicionar detalhes específicos por objetivo de investimento
  let detalhesObjetivo = "";
  switch (objetivo) {
    case "retirement":
      detalhesObjetivo =
        " Como seu objetivo é a aposentadoria, a estratégia enfatiza a construção gradual de um patrimônio que possa gerar renda passiva sustentável no futuro, com foco na preservação do poder de compra e crescimento consistente.";
      break;
    case "reserve":
      detalhesObjetivo =
        " Para seu objetivo de reserva de emergência, a estratégia prioriza liquidez e segurança, com instrumentos que permitem acesso rápido aos recursos quando necessário, mantendo o poder de compra.";
      break;
    case "education":
      detalhesObjetivo =
        " Considerando seu objetivo de financiar educação, a estratégia estabelece um cronograma de investimentos alinhado com as necessidades futuras de desembolso, equilibrando crescimento inicial com preservação de capital à medida que se aproxima do objetivo.";
      break;
    case "property":
      detalhesObjetivo =
        " Para seu objetivo de aquisição de imóvel, a estratégia estabelece uma trajetória de acumulação com horizonte definido, aumentando gradualmente a segurança dos investimentos à medida que se aproxima da data-alvo para a compra.";
      break;
    case "wealth":
      detalhesObjetivo =
        " Alinhada ao seu objetivo de crescimento de patrimônio, a estratégia maximiza o potencial de valorização no longo prazo, com diversificação entre classes de ativos e regiões geográficas para capturar oportunidades globais de crescimento.";
      break;
    case "income":
      detalhesObjetivo =
        " Para seu objetivo de geração de renda, a estratégia prioriza ativos que distribuem rendimentos regulares, como dividendos, juros e aluguéis, criando um fluxo constante de receitas para complementar ou substituir a renda do trabalho.";
      break;
    default:
      detalhesObjetivo =
        " A estratégia foi personalizada para atender seus objetivos financeiros específicos, equilibrando as necessidades de curto prazo com as metas de longo prazo.";
  }

  // Combinar todas as partes para formar a descrição completa e personalizada
  return `${descricaoBase}${detalhesPerfilRisco}${detalhesHorizonte}${detalhesObjetivo}`;
};

// Função para adicionar informações específicas da estratégia ao PDF
const adicionarInformacoesEstrategia = (
  doc: any,
  estrategia: string,
  yPosition: number,
  margin: number,
  pageWidth: number,
  recommendation: Recomendacao,
) => {
  // Extrair informações relevantes da recomendação
  const perfilRisco = recommendation.perfilRisco || "Moderado";
  const horizonteInvestimento =
    recommendation.horizonteInvestimento || "5 anos (Médio Prazo)";
  const objetivo = recommendation.objetivoInvestimento || "wealth";

  // Obter descrição personalizada da estratégia
  const estrategiaInfo = getEstrategiaDescricao(
    estrategia,
    perfilRisco,
    horizonteInvestimento,
    objetivo,
  );
  const splitText = doc.splitTextToSize(estrategiaInfo, pageWidth - margin * 2);
  doc.text(splitText, margin, yPosition);
  yPosition += splitText.length * 6 + 10;

  // Adicionar princípios da estratégia
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Princípios Fundamentais:", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");

  // Princípios comuns a todas as estratégias
  const principiosComuns = [
    "• Diversificação entre classes de ativos não correlacionadas",
    "• Rebalanceamento regular para manter as alocações alvo",
  ];

  // Princípios específicos por estratégia e perfil de risco
  const principiosEspecificos = getPrincipiosEspecificos(
    estrategia,
    perfilRisco,
    horizonteInvestimento,
    objetivo,
  );

  // Combinar princípios comuns e específicos
  const principios = [...principiosComuns, ...principiosEspecificos];

  principios.forEach((principio) => {
    doc.text(principio, margin, yPosition);
    yPosition += 6;
  });

  return yPosition + 4;
};

// Função para obter princípios específicos baseados na estratégia e perfil
const getPrincipiosEspecificos = (
  estrategia: string,
  perfilRisco: string,
  horizonteInvestimento: string,
  objetivo: string,
): string[] => {
  const principios: string[] = [];

  // Princípios específicos por estratégia
  switch (estrategia) {
    case "Portfólio Permanente":
      principios.push(
        "• Proteção contra diferentes cenários econômicos: inflação, deflação, prosperidade e recessão",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Divisão equilibrada entre ações de baixa volatilidade, títulos de alta qualidade, ouro e caixa",
        );
        principios.push(
          "• Foco na preservação de capital e estabilidade em diferentes ciclos econômicos",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Divisão clássica entre ações, títulos de longo prazo, ouro e caixa (25% cada)",
        );
        principios.push(
          "• Baixa frequência de rebalanceamento (anual ou quando houver desvios significativos)",
        );
      } else {
        // Agressivo
        principios.push(
          "• Adaptação do modelo clássico com inclusão de criptomoedas e ações de crescimento",
        );
        principios.push(
          "• Maior exposição a ativos de crescimento mantendo a estrutura de proteção contra cenários adversos",
        );
      }
      break;

    case "Portfólio All Weather":
      principios.push("• Equilíbrio entre ativos de crescimento e proteção");
      principios.push(
        "• Diversificação por fatores de risco, não apenas por classes de ativos",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Maior alocação em títulos de renda fixa de alta qualidade e proteção contra inflação",
        );
        principios.push(
          "• Exposição limitada a ativos de maior volatilidade, priorizando estabilidade",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Alocação balanceada entre ações (30%), títulos de longo prazo (40%), commodities (15%) e caixa (15%)",
        );
        principios.push(
          "• Proteção equilibrada contra diferentes ambientes econômicos",
        );
      } else {
        // Agressivo
        principios.push(
          "• Maior exposição a ações de crescimento e mercados emergentes",
        );
        principios.push(
          "• Inclusão de criptomoedas como hedge adicional contra inflação e desvalorização monetária",
        );
      }
      break;

    case "Tradicional 60/40":
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Alocação ajustada para 40% em ações e 60% em renda fixa",
        );
        principios.push(
          "• Foco em ações de dividendos e títulos de alta qualidade",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push("• Alocação clássica de 60% em ações para crescimento");
        principios.push(
          "• Alocação de 40% em títulos para estabilidade e renda",
        );
      } else {
        // Agressivo
        principios.push(
          "• Alocação ampliada para 70-80% em ações, com foco em crescimento",
        );
        principios.push(
          "• Inclusão de exposição a criptomoedas e ativos alternativos",
        );
      }
      principios.push(
        "• Simplicidade e facilidade de implementação e manutenção",
      );
      break;

    case "Otimização de Markowitz":
      principios.push(
        "• Maximização do retorno para um determinado nível de risco",
      );
      principios.push(
        "• Utilização de correlações entre ativos para otimizar a carteira",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Construção de portfólio na parte mais segura da fronteira eficiente",
        );
        principios.push(
          "• Priorização de ativos com menor volatilidade histórica",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Equilíbrio entre risco e retorno na fronteira eficiente",
        );
        principios.push(
          "• Diversificação ampla para reduzir o risco não sistemático",
        );
      } else {
        // Agressivo
        principios.push(
          "• Posicionamento na parte mais arriscada da fronteira eficiente",
        );
        principios.push(
          "• Inclusão de ativos alternativos e criptomoedas para potencializar retornos",
        );
      }
      break;

    case "Paridade de Risco":
      principios.push(
        "• Contribuição igual de risco de cada classe de ativo para o portfólio total",
      );
      principios.push(
        "• Menor concentração em ativos voláteis, maior diversificação efetiva",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Uso de alavancagem limitada ou nula para ativos de menor risco",
        );
        principios.push(
          "• Foco em estabilidade e redução de drawdowns em períodos de crise",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Balanceamento entre classes de ativos considerando suas volatilidades",
        );
        principios.push(
          "• Uso moderado de alavancagem para ativos de menor risco quando apropriado",
        );
      } else {
        // Agressivo
        principios.push(
          "• Inclusão de criptomoedas e alternativos com peso ajustado pelo risco",
        );
        principios.push(
          "• Uso estratégico de alavancagem para potencializar retornos em ativos de menor risco",
        );
      }
      break;

    case "Black-Litterman":
      principios.push(
        "• Combinação de visões do investidor com equilíbrio de mercado",
      );
      principios.push(
        "• Abordagem bayesiana para estimativas de retorno mais robustas",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Visões conservadoras sobre retornos futuros, com baixa convicção em desvios significativos",
        );
        principios.push(
          "• Maior peso para o equilíbrio de mercado, reduzindo riscos de estimativa",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Equilíbrio entre visões próprias e dados de mercado",
        );
        principios.push(
          "• Ajustes táticos moderados baseados em análises fundamentais",
        );
      } else {
        // Agressivo
        principios.push(
          "• Maior peso para visões próprias sobre oportunidades de mercado",
        );
        principios.push(
          "• Inclusão de visões sobre criptomoedas e setores de alto crescimento",
        );
      }
      break;

    case "Pesos Iguais":
      principios.push("• Simplicidade e transparência na alocação");
      principios.push(
        "• Redução do risco de timing de mercado e erros de estimativa",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Distribuição igualitária entre classes de ativos de menor risco",
        );
        principios.push(
          "• Exclusão ou limitação de exposição a ativos mais voláteis",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Distribuição uniforme entre ações, renda fixa, imóveis e commodities",
        );
        principios.push(
          "• Rebalanceamento periódico para manter a igualdade entre classes",
        );
      } else {
        // Agressivo
        principios.push(
          "• Inclusão de criptomoedas como classe adicional com peso igual",
        );
        principios.push(
          "• Maior granularidade na divisão de classes de ativos de crescimento",
        );
      }
      break;

    case "Momentum e Rotação":
      principios.push(
        "• Foco em ativos com forte desempenho recente (momentum)",
      );
      principios.push(
        "• Rotações táticas entre classes de ativos baseadas em desempenho relativo",
      );
      if (perfilRisco === "Conservador") {
        principios.push("• Rotações limitadas a ativos de menor volatilidade");
        principios.push(
          "• Maior percentual em posição defensiva/caixa durante períodos de incerteza",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Equilíbrio entre captura de tendências e controle de risco",
        );
        principios.push(
          "• Uso de médias móveis e indicadores técnicos para identificar tendências sustentáveis",
        );
      } else {
        // Agressivo
        principios.push(
          "• Rotações mais frequentes e exposição a setores de alto beta",
        );
        principios.push(
          "• Monitoramento de momentum em criptomoedas e setores emergentes",
        );
      }
      break;

    case "Variância Mínima":
      principios.push(
        "• Foco na minimização da volatilidade total do portfólio",
      );
      principios.push("• Exploração de correlações negativas entre ativos");
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Priorização absoluta da estabilidade sobre retornos potenciais",
        );
        principios.push(
          "• Seleção de ativos com histórico comprovado de baixa volatilidade",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Equilíbrio entre minimização de volatilidade e retorno adequado",
        );
        principios.push(
          "• Inclusão de ativos de maior retorno quando oferecem diversificação significativa",
        );
      } else {
        // Agressivo
        principios.push(
          "• Adição controlada de ativos de maior retorno/risco para melhorar o perfil risco-retorno",
        );
        principios.push(
          "• Alocação limitada em criptomoedas para diversificação, com peso ajustado pelo risco",
        );
      }
      break;

    case "Alocação Personalizada":
      principios.push(
        "• Adaptação às suas necessidades e objetivos financeiros específicos",
      );
      principios.push(
        "• Flexibilidade para ajustes conforme mudanças em suas circunstâncias",
      );
      if (perfilRisco === "Conservador") {
        principios.push(
          "• Priorização de preservação de capital e geração de renda",
        );
        principios.push(
          "• Exposição controlada a ativos de crescimento para combater a inflação",
        );
      } else if (perfilRisco === "Moderado") {
        principios.push(
          "• Equilíbrio entre crescimento de capital e controle de risco",
        );
        principios.push(
          "• Diversificação ampla entre classes de ativos e regiões geográficas",
        );
      } else {
        // Agressivo
        principios.push("• Foco em maximização de retornos de longo prazo");
        principios.push(
          "• Exposição estratégica a setores de alto crescimento e ativos alternativos",
        );
      }
      break;

    default:
      principios.push("• Proteção contra inflação e deflação");
      principios.push(
        "• Exposição equilibrada ao crescimento econômico e à contração econômica",
      );
  }

  // Adicionar princípios específicos por horizonte de investimento
  const anosMatch = horizonteInvestimento.match(/(\d+)\s*anos/);
  const anos = anosMatch ? parseInt(anosMatch[1]) : 5;

  if (anos <= 3) {
    // Curto prazo
    principios.push(
      "• Priorização de liquidez e preservação de capital no curto prazo",
    );
    principios.push(
      "• Limitação de exposição a ativos com alta volatilidade ou baixa liquidez",
    );
  } else if (anos >= 10) {
    // Longo prazo
    principios.push(
      "• Aproveitamento do poder dos juros compostos no longo prazo",
    );
    principios.push(
      "• Maior tolerância a volatilidade de curto prazo em favor de retornos superiores",
    );
  }

  // Adicionar princípios específicos por objetivo
  switch (objetivo) {
    case "retirement":
      principios.push(
        "• Construção gradual de patrimônio para geração de renda na aposentadoria",
      );
      principios.push(
        "• Transição progressiva para ativos geradores de renda à medida que se aproxima do objetivo",
      );
      break;
    case "income":
      principios.push(
        "• Priorização de ativos geradores de renda regular (dividendos, juros, aluguéis)",
      );
      principios.push(
        "• Foco na sustentabilidade e crescimento gradual dos rendimentos ao longo do tempo",
      );
      break;
    case "wealth":
      principios.push("• Maximização do crescimento de capital no longo prazo");
      principios.push(
        "• Captura de oportunidades de valorização em diferentes mercados e setores",
      );
      break;
  }

  return principios;
};
