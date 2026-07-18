import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { useCart } from './contexts/CartContext';

interface Msg {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SAUDACAO: Msg = {
  role: 'assistant',
  content:
    'Olá! 👋 Sou o atendente virtual do Tartan. Posso ajudar com o cardápio, ' +
    'sugestões de pratos e como fazer seu pedido. O que você gostaria hoje?',
};

export function Chat() {
  const [aberto, setAberto] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [model, setModel] = useState('');
  const [mensagens, setMensagens] = useState<Msg[]>([SAUDACAO]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { addAoCarrinho } = useCart();
  const [produtosCatalogo, setProdutosCatalogo] = useState<any[]>([]);

  useEffect(() => {
    if (!aberto) return;
    api
      .chatStatus()
      .then((s) => {
        setOnline(s.online);
        setModel(s.model);
      })
      .catch(() => setOnline(false));

    api.produtos().then(setProdutosCatalogo).catch(() => {});
  }, [aberto]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [mensagens, carregando]);

  async function enviar() {
    const conteudo = texto.trim();
    if (!conteudo || carregando) return;
    const novas: Msg[] = [...mensagens, { role: 'user', content: conteudo }];
    setMensagens(novas);
    setTexto('');
    setCarregando(true);
    try {
      const historico = novas.filter((m) => m.role !== 'system');
      const resp = await api.chat(historico);
      let answer = resp.content;

      // Extract [ADD:<id>]
      const addMatch = answer.match(/\[ADD:([a-zA-Z0-9-]+)\]/);
      if (addMatch) {
        const id = addMatch[1];
        const produto = produtosCatalogo.find((p) => p.id === id);
        if (produto) {
          addAoCarrinho(produto);
          answer = answer.replace(addMatch[0], '').trim();
          answer += `\n\n*(✔️ ${produto.nome} foi adicionado ao seu carrinho!)*`;
        }
      }

      setMensagens([...novas, { role: 'assistant', content: answer }]);
      setOnline(true);
    } catch (e: any) {
      setMensagens([
        ...novas,
        {
          role: 'system',
          content:
            '⚠️ ' +
            (e.message ||
              'Assistente indisponível. Verifique se o Ollama está rodando.'),
        },
      ]);
      setOnline(false);
    } finally {
      setCarregando(false);
    }
  }

  if (!aberto) {
    return (
      <button className="chat-fab" title="Fale com a gente" onClick={() => setAberto(true)}>
        💬
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <div className="title">Atendimento Tartan</div>
          <div className={`status ${online ? 'on' : 'off'}`}>
            {online === null
              ? 'conectando…'
              : online
                ? `online · ${model}`
                : 'assistente offline'}
          </div>
        </div>
        <button className="close" onClick={() => setAberto(false)}>
          ×
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {mensagens.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content}
          </div>
        ))}
        {carregando && <div className="typing">digitando…</div>}
      </div>

      <div className="chat-input">
        <input
          value={texto}
          placeholder="Escreva sua mensagem…"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          disabled={carregando}
        />
        <button className="btn" onClick={enviar} disabled={carregando || !texto.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}
