# Volatility-Regime-Model-v2
Modelo computacional para análise estrutural de risco baseado em regimes de volatilidade, simulação Monte Carlo e análise de cauda. O foco não é previsão de preços, mas mapeamento do espaço de possibilidades e identificação de transições de regime em mercados financeiros.
Visão Geral
Este projeto implementa um sistema que:
Simula milhares de trajetórias de preço via processos estocásticos
Classifica o comportamento do mercado em regimes de volatilidade
Analisa dispersão temporal, payoff final e risco de cauda
Visualiza a dinâmica do sistema em múltiplas perspectivas
O resultado é um research prototype, não um indicador de trading.
Conceito Central
Risco relevante não está na média, mas na transição entre regimes.
Mercados alternam entre períodos de estabilidade, reprecificação e estresse.
Este modelo busca tornar essas transições observáveis e quantificáveis.

Estrutura do Modelo
1. Simulação Estocástica
Horizonte anual
Volatilidade variável
Ruído browniano

1.500 trajetórias independentes (Monte Carlo)
A simulação permite observar a geometria completa dos resultados, não apenas cenários médios.

2. Regimes de Volatilidade
O sistema opera com três regimes principais:
Regime/Descrição
Calmo / Baixa volatilidade e dispersão
Transição / Aumento progressivo de variância
Extremo / Alta volatilidade e drawdowns

Os regimes são inferidos a partir de variáveis de estado como:
volatilidade instantânea
drawdown acumulado
dispersão das trajetórias
O modelo gera um mapa temporal de regimes agregando o comportamento de todas as simulações.

3. Análises Implementadas
Fan chart (mediana, P25/P75, P5/P95)
Distribuição de payoff com separação explícita de caudas
Análise de tail risk (downside e upside)
Espaço de fase (volatilidade × drawdown)
Essas visualizações evidenciam regiões de estabilidade, transição e instabilidade do sistema.

Stack Tecnológica
• JavaScript / JSX
• Simulação numérica customizada
• Visualização interativa (dashboard)
O projeto foi pensado para clareza estrutural, não para dependência excessiva de bibliotecas externas.

Limitações Conhecidas

Regimes ainda são parcialmente inferidos ex-post
Não há calibração direta com dados históricos reais
O modelo não é um sistema de previsão nem de trading automático
Essas limitações são intencionais, para manter foco em análise estrutural.

Possíveis Extensões
•Regimes totalmente endógenos (dependentes do estado do sistema)
•Calibração com dados reais (retornos, VIX, volume)
•Estudo de sensibilidade dos parâmetros
•Integração com métricas de risco de portfólio

Objetivo do Projeto
Este projeto foi desenvolvido como:
Research prototype
Artefato técnico de portfólio
Estudo aplicado de dinâmica de risco
Não é um produto comercial nem uma ferramenta de recomendação financeira.

Aviso
Este repositório tem finalidade educacional e exploratória.
Nenhuma parte do código ou das análises constitui recomendação de investimento.
