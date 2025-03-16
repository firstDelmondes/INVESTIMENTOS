/**
 * Utilitários para cálculos e recomendações de investimentos
 */

/**
 * Calcula o horizonte de investimento recomendado com base na idade e objetivo
 * @param age Idade do cliente
 * @param objective Objetivo do investimento
 * @returns Horizonte recomendado em anos
 */
export const calculateRecommendedHorizon = (
  age: number,
  objective: string,
): number => {
  // Base inicial
  let baseHorizon = 10;

  // Ajustes por idade
  if (age < 30) {
    baseHorizon += 5; // Jovens podem ter horizontes mais longos
  } else if (age > 55) {
    baseHorizon -= 5; // Pessoas mais velhas tendem a ter horizontes mais curtos
  }

  // Ajustes por objetivo
  switch (objective) {
    case "retirement":
      // Para aposentadoria, considerar a idade
      return Math.max(65 - age, 1);
    case "reserve":
      // Reserva de emergência é sempre curto prazo
      return 1;
    case "education":
      // Educação geralmente tem prazo definido
      return 5;
    case "property":
      // Compra de imóvel geralmente é médio prazo
      return 7;
    case "wealth":
      // Crescimento de patrimônio é longo prazo
      return Math.max(baseHorizon, 10);
    case "income":
      // Geração de renda pode ser médio prazo
      return 5;
    case "travel":
      // Viagens geralmente são curto prazo
      return 2;
    default:
      return baseHorizon;
  }
};

/**
 * Calcula o perfil de risco recomendado com base na idade, objetivo e horizonte
 * @param age Idade do cliente
 * @param objective Objetivo do investimento
 * @param horizon Horizonte de investimento em anos
 * @returns Perfil de risco recomendado ("conservador", "moderado" ou "agressivo")
 */
export const calculateRecommendedRiskProfile = (
  age: number,
  objective: string,
  horizon: number,
): string => {
  // Sistema de pontuação
  let riskScore = 50; // Começa como moderado (0-33: conservador, 34-66: moderado, 67-100: agressivo)

  // Ajustes por idade
  if (age < 30) {
    riskScore += 20; // Jovens podem assumir mais riscos
  } else if (age > 55) {
    riskScore -= 20; // Pessoas mais velhas tendem a ser mais conservadoras
  }

  // Ajustes por horizonte
  if (horizon < 3) {
    riskScore -= 25; // Horizontes curtos exigem mais conservadorismo
  } else if (horizon > 10) {
    riskScore += 15; // Horizontes longos permitem mais risco
  }

  // Ajustes por objetivo
  switch (objective) {
    case "retirement":
      if (age > 50) {
        riskScore -= 15; // Aposentadoria próxima: mais conservador
      }
      break;
    case "reserve":
      riskScore -= 40; // Reserva de emergência: muito conservador
      break;
    case "education":
      riskScore -= 10; // Educação: moderadamente conservador
      break;
    case "property":
      riskScore -= 5; // Compra de imóvel: ligeiramente conservador
      break;
    case "wealth":
      riskScore += 15; // Crescimento de patrimônio: mais agressivo
      break;
    case "income":
      riskScore -= 5; // Geração de renda: ligeiramente conservador
      break;
    case "travel":
      riskScore -= 10; // Viagens: moderadamente conservador
      break;
  }

  // Determinar perfil com base na pontuação
  if (riskScore < 33) {
    return "conservador";
  } else if (riskScore < 67) {
    return "moderado";
  } else {
    return "agressivo";
  }
};

/**
 * Calcula a estratégia recomendada com base no perfil de risco e objetivo
 * @param riskProfile Perfil de risco
 * @param objective Objetivo do investimento
 * @returns Estratégia recomendada
 */
export const calculateRecommendedStrategy = (
  riskProfile: string,
  objective: string,
): string => {
  // Estratégias por perfil de risco
  const strategiesByRisk = {
    conservador: ["permanent", "allweather"],
    moderado: ["allweather", "traditional"],
    agressivo: ["traditional", "custom"],
  };

  // Estratégias por objetivo
  const strategiesByObjective = {
    retirement: "allweather",
    reserve: "permanent",
    education: "allweather",
    property: "traditional",
    wealth: "custom",
    income: "allweather",
    travel: "traditional",
  };

  // Se o objetivo tem uma estratégia específica recomendada
  if (objective in strategiesByObjective) {
    const objectiveStrategy = strategiesByObjective[objective];

    // Verificar se a estratégia do objetivo é compatível com o perfil de risco
    if (
      riskProfile in strategiesByRisk &&
      strategiesByRisk[riskProfile].includes(objectiveStrategy)
    ) {
      return objectiveStrategy;
    }
  }

  // Caso contrário, usar a primeira estratégia recomendada para o perfil de risco
  if (riskProfile in strategiesByRisk) {
    return strategiesByRisk[riskProfile][0];
  }

  // Fallback para allweather se algo der errado
  return "allweather";
};

/**
 * Calcula o valor mínimo recomendado para um objetivo específico
 * @param objective Objetivo do investimento
 * @param age Idade do cliente
 * @returns Valor mínimo recomendado em reais
 */
export const calculateMinimumInvestment = (
  objective: string,
  age: number,
): number => {
  switch (objective) {
    case "retirement":
      // Para aposentadoria, valor mínimo aumenta com a idade
      return Math.max(10000, (age - 20) * 5000);
    case "reserve":
      // Reserva de emergência: geralmente 6 meses de despesas (estimativa)
      return 10000;
    case "education":
      // Educação: valor mínimo para começar a poupar para educação
      return 15000;
    case "property":
      // Compra de imóvel: entrada mínima
      return 50000;
    case "wealth":
      // Crescimento de patrimônio: valor mínimo para diversificação adequada
      return 20000;
    case "income":
      // Geração de renda: valor mínimo para gerar renda significativa
      return 100000;
    case "travel":
      // Viagens: valor mínimo para uma viagem
      return 5000;
    default:
      return 10000;
  }
};

/**
 * Calcula a alocação de ativos recomendada com base no perfil de risco, idade e objetivo
 * @param riskProfile Perfil de risco
 * @param age Idade do cliente
 * @param objective Objetivo do investimento
 * @returns Objeto com a alocação recomendada em percentuais
 */
export const calculateRecommendedAllocation = (
  riskProfile: string,
  age: number,
  objective: string,
): { [key: string]: number } => {
  // Alocações base por perfil de risco
  const baseAllocations = {
    conservador: {
      acoes: 20,
      rendaFixa: 60,
      alternativos: 10,
      caixa: 10,
    },
    moderado: {
      acoes: 40,
      rendaFixa: 40,
      alternativos: 15,
      caixa: 5,
    },
    agressivo: {
      acoes: 60,
      rendaFixa: 20,
      alternativos: 15,
      caixa: 5,
    },
  };

  // Obter alocação base para o perfil de risco
  const baseAllocation =
    baseAllocations[riskProfile] || baseAllocations.moderado;

  // Clonar para não modificar o original
  const allocation = { ...baseAllocation };

  // Ajustes por idade
  if (age < 30) {
    // Jovens: mais ações, menos renda fixa
    allocation.acoes = Math.min(allocation.acoes + 10, 80);
    allocation.rendaFixa = Math.max(allocation.rendaFixa - 10, 10);
  } else if (age > 55) {
    // Mais velhos: menos ações, mais renda fixa
    allocation.acoes = Math.max(allocation.acoes - 10, 10);
    allocation.rendaFixa = Math.min(allocation.rendaFixa + 10, 70);
  }

  // Ajustes por objetivo
  switch (objective) {
    case "retirement":
      if (age > 50) {
        // Aposentadoria próxima: mais conservador
        allocation.acoes = Math.max(allocation.acoes - 15, 10);
        allocation.rendaFixa = Math.min(allocation.rendaFixa + 15, 70);
      }
      break;
    case "reserve":
      // Reserva de emergência: muito conservador
      allocation.acoes = Math.max(allocation.acoes - 15, 0);
      allocation.caixa = Math.min(allocation.caixa + 15, 50);
      break;
    case "wealth":
      // Crescimento de patrimônio: mais agressivo
      allocation.acoes = Math.min(allocation.acoes + 10, 80);
      allocation.caixa = Math.max(allocation.caixa - 5, 0);
      break;
    case "income":
      // Geração de renda: foco em ativos geradores de renda
      allocation.alternativos = Math.min(allocation.alternativos + 10, 30);
      allocation.acoes = Math.max(allocation.acoes - 5, 10);
      break;
  }

  // Normalizar para garantir que some 100%
  const total = Object.values(allocation).reduce(
    (sum, value) => sum + value,
    0,
  );
  if (total !== 100) {
    const factor = 100 / total;
    Object.keys(allocation).forEach((key) => {
      allocation[key] = Math.round(allocation[key] * factor);
    });
  }

  return allocation;
};
