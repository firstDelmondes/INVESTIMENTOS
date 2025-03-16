import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Recomendacao } from "./db";

// Função para exportar uma recomendação como PDF
export const exportRecommendationToPDF = (recommendation: Recomendacao) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Adicionar cabeçalho
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = "Relatório de Alocação de Investimentos";
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
      doc.text(`Idade: ${recommendation.idadeCliente} anos`, margin, yPosition);
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
      { nome: "Renda Fixa", percentual: 40, cor: "#10b981" },
      { nome: "Alternativos", percentual: 15, cor: "#f59e0b" },
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

    // Adicionar rodapé
    if (yPosition + 20 > pageHeight) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    const disclaimer =
      "Este relatório é apenas para fins informativos e não constitui aconselhamento de investimento. " +
      "Os valores e projeções apresentados são baseados em dados históricos e não garantem resultados futuros. " +
      "Consulte um profissional financeiro antes de tomar decisões de investimento.";

    const disclaimerLines = doc.splitTextToSize(
      disclaimer,
      pageWidth - margin * 2,
    );
    doc.text(disclaimerLines, margin, pageHeight - 20);

    // Salvar o PDF
    const clientName = recommendation.nomeCliente || "cliente";
    doc.save(
      `relatorio_investimento_${clientName.replace(/\s+/g, "_")}_${date.replace(/\//g, "-")}.pdf`,
    );

    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return false;
  }
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

// Função auxiliar para obter descrição da estratégia
const getEstrategiaDescricao = (estrategia: string): string => {
  const descricoes: Record<string, string> = {
    "Portfólio Permanente":
      "O Portfólio Permanente é uma estratégia de investimento que busca manter o valor do capital em diferentes cenários econômicos. Ele divide os investimentos igualmente entre quatro classes de ativos: ações, títulos de longo prazo, ouro e caixa, cada um representando 25% da carteira.",
    "Portfólio All Weather":
      "O Portfólio All Weather é uma estratégia desenvolvida para ter bom desempenho em qualquer ambiente econômico. Ele equilibra exposições a crescimento, inflação, deflação e recessão, distribuindo os investimentos entre ações, títulos de longo e médio prazo, commodities e caixa.",
    "Tradicional 60/40":
      "A estratégia Tradicional 60/40 aloca 60% dos investimentos em ações e 40% em títulos de renda fixa. É uma abordagem clássica que busca equilibrar crescimento e estabilidade, sendo amplamente utilizada por investidores de longo prazo.",
    "Otimização de Markowitz":
      "Baseada na Teoria Moderna do Portfólio, a Otimização de Markowitz busca maximizar o retorno esperado para um determinado nível de risco. Utiliza correlações entre ativos para criar uma carteira eficiente na fronteira de possibilidades de investimento.",
    "Paridade de Risco":
      "A estratégia de Paridade de Risco aloca os investimentos de forma que cada classe de ativos contribua igualmente para o risco total do portfólio. Isso geralmente resulta em maior diversificação e menor concentração em ativos mais voláteis como ações.",
    "Black-Litterman":
      "O modelo Black-Litterman combina as visões do investidor sobre o mercado com o equilíbrio de mercado para criar alocações personalizadas. É uma abordagem sofisticada que permite incorporar expectativas específicas sobre classes de ativos.",
    "Pesos Iguais":
      "A estratégia de Pesos Iguais distribui o capital uniformemente entre todas as classes de ativos disponíveis. É uma abordagem simples que evita a concentração excessiva e pode oferecer benefícios de diversificação.",
    "Momentum e Rotação":
      "Esta estratégia investe em ativos que demonstraram forte desempenho recente (momentum) e realiza rotações periódicas entre classes de ativos com base em seu desempenho relativo. Busca capturar tendências de mercado de curto a médio prazo.",
    "Variância Mínima":
      "A estratégia de Variância Mínima busca criar um portfólio com a menor volatilidade possível, independentemente do retorno esperado. Foca em ativos de baixa volatilidade e correlações negativas para minimizar as oscilações do portfólio.",
    "Alocação Personalizada":
      "Esta estratégia foi personalizada especificamente para seu perfil de risco, horizonte de investimento e objetivos financeiros. Combina elementos de diversas abordagens para criar uma alocação sob medida para suas necessidades.",
  };

  return (
    descricoes[estrategia] ||
    "Estratégia personalizada baseada no seu perfil de risco e horizonte de investimento."
  );
};

// Função para adicionar informações específicas da estratégia ao PDF
const adicionarInformacoesEstrategia = (
  doc: any,
  estrategia: string,
  yPosition: number,
  margin: number,
  pageWidth: number,
) => {
  const estrategiaInfo = getEstrategiaDescricao(estrategia);
  const splitText = doc.splitTextToSize(estrategiaInfo, pageWidth - margin * 2);
  doc.text(splitText, margin, yPosition);
  yPosition += splitText.length * 6 + 10;

  // Adicionar princípios da estratégia
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Princípios Fundamentais:", margin, yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "normal");

  const principios = [
    "• Diversificação entre classes de ativos não correlacionadas",
    "• Proteção contra inflação e deflação",
    "• Exposição equilibrada ao crescimento econômico e à contração econômica",
    "• Rebalanceamento regular para manter as alocações alvo",
  ];

  // Adicionar princípios específicos por estratégia
  if (estrategia === "Portfólio Permanente") {
    principios.push(
      "• Divisão igualitária entre ações, títulos de longo prazo, ouro e caixa",
    );
    principios.push("• Baixa frequência de rebalanceamento (anual)");
  } else if (estrategia === "Portfólio All Weather") {
    principios.push("• Equilíbrio entre ativos de crescimento e proteção");
    principios.push(
      "• Diversificação por fatores de risco, não apenas por classes de ativos",
    );
  } else if (estrategia === "Tradicional 60/40") {
    principios.push("• Alocação de 60% em ações para crescimento");
    principios.push("• Alocação de 40% em títulos para estabilidade");
  }

  principios.forEach((principio) => {
    doc.text(principio, margin, yPosition);
    yPosition += 6;
  });

  return yPosition + 4;
};
