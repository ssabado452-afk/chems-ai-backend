const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Base de respostas simuladas por tópico
const RESPONSES = {
  'complexos de coordenação': {
    'Secundário': 'Um complexo de coordenação é quando um ião metálico (como Cu²⁺) se liga a outras moléculas chamadas ligandos. Por exemplo, [Cu(NH₃)₄]²⁺ tem um cobre ligado a 4 moléculas de amónia.',
    'Técnico': 'Os complexos de coordenação são formados pela ligação de um ião metálico central a ligandos através de ligações covalentes coordenadas. O número de ligandos é chamado número de coordenação. Exemplo: em [Fe(CN)₆]⁴⁻, o ferro tem número de coordenação 6.',
    'Universitário': 'Um complexo de coordenação consiste num ião ou átomo metálico central ligado a ligandos via ligações σ. A geometria pode ser tetraédrica, octaédrica ou quadrada planar. Teorias como a Teoria do Campo Cristalino explicam a estabilidade e propriedades magnéticas.',
    'Avançado': 'Complexos de coordenação envolvem interações metal-ligando sob a perspectiva de teoria de orbitais moleculares. Consideram-se d⁰, d¹⁰ e estados intermediários. A Teoria do Campo Cristalino (CFT) e o modelo de Ligand Field explicam splitting de orbitais d e propriedades espectroscópicas.'
  },
  'tabela periódica': {
    'Secundário': 'A tabela periódica organiza os elementos por propriedades. Tem linhas (períodos) e colunas (grupos). Elementos no mesmo grupo têm propriedades semelhantes. Grupos importantes: metais alcalinos, halogénios, gases nobres.',
    'Técnico': 'A tabela periódica tem 18 grupos e 7 períodos. Os elementos estão organizados por número atómico. Metais (esquerda), semimetais (meio), não-metais (direita). A eletronegatividade e raio atómico variam sistematicamente.',
    'Universitário': 'A tabela periódica moderna (IUPAC, 2016) reorganiza os grupos 3-12 (metais de transição). O preenchimento dos orbitais (s, p, d, f) explica a periodicidade. Tendências: eletronegatividade, energia de ionização, afinidade eletrónica.',
    'Avançado': 'Análise relativística de elementos pesados altera comportamento esperado (ex: Au não segue padrão de grupo 11). Dinâmica quântica de valência, efeitos de par inerte em pós-lantanídios, e comportamento anómalo em períodos 6 e 7.'
  },
  'balancear equações': {
    'Secundário': 'Para balancear uma equação química: 1) Conta átomos de cada elemento nos reagentes e produtos. 2) Ajusta números à frente (coeficientes). 3) Cada elemento deve ter o mesmo número de átomos em ambos os lados. Exemplo: 2H₂ + O₂ → 2H₂O',
    'Técnico': 'Método do balanceamento por tentativa: identifica átomos de difícil balanceamento primeiro (metais, depois não-metais, depois O e H). Usa múltiplos de 2, 3, 4 para simplificar. Em reações redox, usa método do número de oxidação ou meia-reação.',
    'Universitário': 'Para reações redox complexas, o método da meia-reação é mais sistemático: separa oxidação e redução, iguala electrões, depois combina. Conta-se com cuidado átomos em soluções aquosas (H⁺, OH⁻, H₂O). Considerações de fase (aq, s, g, l).',
    'Avançado': 'Em meios básicos vs ácidos, o balanceamento difere (neutraliza com OH⁻ ou H⁺). Reações em cadeia e mecanismos multi-etapa requerem análise de intermediários. Algoritmos computacionais usam matrizes para sistemas complexos com muitos reagentes/produtos.'
  },
  'lei de hess': {
    'Secundário': 'A Lei de Hess diz que a energia libertada ou absorvida numa reação é a mesma, quer a reação ocorra em uma ou várias etapas. Se conheces ΔH de reações parciais, podes somar para obter ΔH total.',
    'Técnico': 'A Lei de Hess é baseada no facto de entalpia ser uma função de estado. ΔH_total = Σ ΔH_reações. Se inverte uma reação, muda o sinal de ΔH. Se multiplica coeficientes por n, multiplica ΔH por n. Útil para calcular ΔH de reações difíceis de medir.',
    'Universitário': 'Formalmente, ΔH = H_produtos - H_reagentes. A Lei de Hess segue da primeira lei da termodinâmica (conservação de energia). Ciclos termodinâmicos usam Hess para verificar consistência. Combinada com dados de tabelas de ΔH_f°, calcula-se ΔH_rxn = Σ ΔH_f°(produtos) - Σ ΔH_f°(reagentes).',
    'Avançado': 'Lei de Hess é corolário de entalpia ser função de estado (caminho independente). Em contextos de termodinâmica estatística, relaciona-se a ΔH com entropia vibracional e rotacional. Cálculos ab initio (Hartree-Fock, DFT) verificam valores experimentais e predict ciclos reacionais complexos.'
  },
  'química geral': {
    'Secundário': 'Química é o estudo das substâncias, reações e transformações. Tópicos principais: átomos, moléculas, ligações químicas, reações, energia. Afecta tudo: água, comida, medicinas, plásticos.',
    'Técnico': 'Química subdivide-se em: Química Inorgânica (metais, sais, ácidos), Orgânica (carbono, cadeias), Analítica (análise de composição), Físico-Química (termodinâmica, cinética), Bioquímica (processos vivos).',
    'Universitário': 'Disciplinas avançadas: Química Quântica (estrutura eletrónica), Química de Coordenação (complexos), Eletroquímica (reações redox), Cinética Química (velocidade reacional), Termodinâmica Química (espontaneidade, equilíbrio).',
    'Avançado': 'Fronteiras: Química computacional (DFT, ab initio), Catálise heterogénea, Síntese orgânica total, Química de superfícies, Astroquímica. Métodos espectroscópicos: NMR, IR, UV-Vis, espectrometria de massa.'
  }
};

// Função para encontrar melhor resposta
function findBestResponse(userText, level) {
  const text = userText.toLowerCase();
  
  // Procura por palavra-chave
  for (const [topic, responses] of Object.entries(RESPONSES)) {
    if (text.includes(topic.split(' ')[0]) || text.includes(topic)) {
      return responses[level] || responses['Universitário'];
    }
  }
  
  // Se nenhuma correspondência, resposta genérica
  return getGenericResponse(level);
}

function getGenericResponse(level) {
  const responses = {
    'Secundário': 'Essa é uma pergunta interessante sobre Química! Para responder melhor, podes ser mais específico? Por exemplo: "Explica ligações químicas", "Como funciona a tabela periódica?", "O que é pH?".',
    'Técnico': 'Essa pergunta está um pouco vaga. Sugerem-se perguntas como: "Mecanismo de reação SN1 vs SN2", "Como calcular pH de soluções tampão?", "Propriedades coligativas de soluções".',
    'Universitário': 'Para uma resposta mais precisa, podes especificar o tópico? Sugestões: "Teoria do campo cristalino", "Mecanismos de reação multi-etapa", "Análise termodinâmica de equilíbrio químico".',
    'Avançado': 'Pergunta muito genérica. Especifica o tópico: "Teoria DFT vs métodos ab initio", "Mecanismos de catálise heterogénea", "Análise conformacional de moléculas complexas".'
  };
  return responses[level] || responses['Universitário'];
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chems AI Backend Simulado está online' });
});

// Endpoint principal
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, level } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages devem ser um array não-vazio' });
    }

    // Pega na última mensagem do utilizador
    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage.text;

    // Encontra a melhor resposta
    const response = findBestResponse(userText, level || 'Universitário');

    // Simula um pequeno delay (como se fosse processar)
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json({ 
      success: true,
      text: response,
      mode: 'simulated'
    });

  } catch (err) {
    console.error('Erro no servidor:', err);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      message: err.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Chems AI Backend SIMULADO está online em http://localhost:${PORT}`);
  console.log(`📌 Endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`\n⚠️  MODO SIMULADO: Respostas pré-definidas (sem API)\n`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Erro não tratado:', reason);
});
