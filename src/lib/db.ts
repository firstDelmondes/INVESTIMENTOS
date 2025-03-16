import Dexie, { Table } from "dexie";

export interface Recomendacao {
  id?: number;
  titulo: string;
  data: Date;
  nomeCliente: string;
  idadeCliente?: number;
  objetivoInvestimento?: string;
  valorInvestimento: number;
  perfilRisco: "Conservador" | "Moderado" | "Agressivo";
  horizonteInvestimento: string;
  estrategia: string;
  alocacaoAtivos: AlocacaoAtivo[];
  status: "Rascunho" | "Final";
  valorPorRelatorio?: number;
}

export interface AlocacaoAtivo {
  nome: string;
  percentual: number;
  cor: string;
}

export interface Ativo {
  id?: number;
  nome: string;
  tipo: string;
  ticker?: string;
  categoria: string;
  descricao?: string;
}

export class AegisDatabase extends Dexie {
  recomendacoes!: Table<Recomendacao>;
  ativos!: Table<Ativo>;

  constructor() {
    super("aegisDatabase");
    this.version(1).stores({
      recomendacoes:
        "++id, titulo, data, perfilRisco, horizonteInvestimento, estrategia, status",
      ativos: "++id, nome, tipo, categoria",
    });
  }
}

// Cria uma única instância do banco de dados
let dbInstance: AegisDatabase | null = null;

export const getDb = (): AegisDatabase => {
  if (!dbInstance) {
    dbInstance = new AegisDatabase();
  }
  return dbInstance;
};

export const db = getDb();

// Inicializar com alguns ativos padrão
export async function inicializarDB() {
  try {
    const ativosCount = await db.ativos.count();

    if (ativosCount === 0) {
      const ativosPadrao = [
        // Ações
        {
          nome: "Ações Brasileiras - Large Cap",
          tipo: "Ação",
          categoria: "Ações",
          descricao: "Empresas brasileiras de grande capitalização",
        },
        {
          nome: "Ações Brasileiras - Small Cap",
          tipo: "Ação",
          categoria: "Ações",
          descricao: "Empresas brasileiras de pequena capitalização",
        },
        {
          nome: "Ações Internacionais - Mercados Desenvolvidos",
          tipo: "Ação",
          categoria: "Ações",
          descricao: "Ações de mercados desenvolvidos fora do Brasil",
        },
        {
          nome: "Ações Internacionais - Mercados Emergentes",
          tipo: "Ação",
          categoria: "Ações",
          descricao: "Ações de mercados emergentes fora do Brasil",
        },

        // Renda Fixa
        {
          nome: "Tesouro Direto",
          tipo: "Renda Fixa",
          categoria: "Títulos Públicos",
          descricao: "Títulos da dívida pública federal",
        },
        {
          nome: "CDBs",
          tipo: "Renda Fixa",
          categoria: "Títulos Privados",
          descricao: "Certificados de Depósito Bancário",
        },
        {
          nome: "Debêntures",
          tipo: "Renda Fixa",
          categoria: "Títulos Privados",
          descricao: "Títulos de dívida emitidos por empresas",
        },
        {
          nome: "LCIs/LCAs",
          tipo: "Renda Fixa",
          categoria: "Títulos Privados",
          descricao: "Letras de Crédito Imobiliário/Agronegócio",
        },

        // Alternativos
        {
          nome: "Fundos Imobiliários",
          tipo: "Alternativo",
          categoria: "Imóveis",
          descricao: "Fundos que investem em ativos imobiliários",
        },
        {
          nome: "Ouro",
          tipo: "Alternativo",
          categoria: "Commodities",
          descricao: "Metal precioso usado como reserva de valor",
        },

        // Criptomoedas (agora como categoria própria)
        {
          nome: "Bitcoin (BTC)",
          tipo: "Criptomoeda",
          categoria: "Criptomoedas",
          descricao:
            "A primeira e mais conhecida criptomoeda, funciona como reserva de valor digital",
        },
        {
          nome: "Ethereum (ETH)",
          tipo: "Criptomoeda",
          categoria: "Criptomoedas",
          descricao:
            "Plataforma de contratos inteligentes e aplicações descentralizadas",
        },
        {
          nome: "Stablecoins",
          tipo: "Criptomoeda",
          categoria: "Criptomoedas",
          descricao:
            "Criptomoedas com valor atrelado a ativos estáveis como o dólar",
        },
        {
          nome: "Altcoins Estabelecidas",
          tipo: "Criptomoeda",
          categoria: "Criptomoedas",
          descricao:
            "Criptomoedas alternativas com capitalização de mercado significativa",
        },

        // Caixa
        {
          nome: "Poupança",
          tipo: "Caixa",
          categoria: "Liquidez",
          descricao: "Conta de poupança tradicional",
        },
        {
          nome: "Fundos DI",
          tipo: "Caixa",
          categoria: "Liquidez",
          descricao: "Fundos que acompanham a taxa DI",
        },
      ];

      await db.ativos.bulkAdd(ativosPadrao);
      console.log("Banco de dados inicializado com ativos padrão");
    } else {
      console.log("Banco de dados já inicializado");
    }
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
    throw error;
  }
}
