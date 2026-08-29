const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Verificar API key
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('❌ ERRO: Variável ANTHROPIC_API_KEY não está definida.');
  console.error('Faz: export ANTHROPIC_API_KEY="sk-ant-..." (ou no Windows: set ANTHROPIC_API_KEY=...)');
  process.exit(1);
}

// Rotas de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chems AI Backend está online' });
});

// Rota principal — Chat com Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, level } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages devem ser um array' });
    }

    const levels = {
      'Secundário': 'O estudante está no nível SECUNDÁRIO. Usa linguagem simples, exemplos do dia-a-dia, evita jargão técnico excessivo. Explica passo a passo.',
      'Técnico': 'O estudante está num nível TÉCNICO. Podes usar nomenclatura técnica, diagramas conceituais, e assumir conhecimentos básicos sólidos.',
      'Universitário': 'O estudante está num nível UNIVERSITÁRIO. Usa nomenclatura IUPAC, teoria formal, mecanismos, cálculos completos. Assume domínio dos fundamentos.',
      'Avançado': 'O estudante está num nível AVANÇADO. Usa teoria profunda (campo cristalino, orbitais moleculares, termodinâmica avançada). Assume domínio completo.'
    };

    const systemPrompt = `És o Chems AI, um tutor de Química especializado, paciente e claro. ${levels[level] || levels['Universitário']}
    
Responde sempre em português. Sê direto e didático. Usa fórmulas químicas quando relevante. Se a pergunta não for sobre Química, redireciona gentilmente para o tópico.

Quando é apropriado, usa marcação:
- **negrito** para destaque
- \`código\` para fórmulas/estruturas
- H_2O para subscritos (ex: H_2O)
- Cu^2+ para superescritos (ex: Cu^2+)`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.text
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro da API Claude:', error);
      return res.status(response.status).json({ 
        error: error.error?.message || 'Erro ao contactar Claude API' 
      });
    }

    const data = await response.json();
    const text = (data.content?.[0]?.text || '').trim();

    res.json({ 
      success: true,
      text: text || 'Não consegui gerar uma resposta.'
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
  console.log(`\n✅ Chems AI Backend está online em http://localhost:${PORT}`);
  console.log(`📌 Endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`\n💡 Dica: Garante que ANTHROPIC_API_KEY está definida.\n`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Erro não tratado:', reason);
});
