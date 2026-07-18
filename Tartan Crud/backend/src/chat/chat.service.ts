import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from '../entities/produto.entity';
import { ChatMessageDto } from './dto';

/**
 * Atendimento ao cliente via chat com LLM local (Ollama), substituindo o
 * canal de WhatsApp descrito na Atividade 03 (seções 5.3/5.4). O backend
 * atua como proxy: injeta o contexto do restaurante (cardápio) como prompt
 * de sistema e encaminha a conversa ao Ollama em localhost:11434.
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Produto)
    private readonly produtos: Repository<Produto>,
  ) {
    this.baseUrl = this.config.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.config.get<string>('OLLAMA_MODEL', 'llama3.2');
  }

  private async promptSistema(): Promise<string> {
    const produtos = await this.produtos.find({ take: 50 });
    const cardapio = produtos
      .filter((p) => p.disponivel)
      .map((p) => `- [${p.id}] ${p.nome}: R$ ${Number(p.preco).toFixed(2)}`)
      .join('\n');
    return [
      'Você é o atendente virtual do restaurante Tartan (culinária japonesa e chinesa) em João Pessoa.',
      'Responda em português do Brasil, de forma cordial e objetiva.',
      'Ajude o cliente a escolher pratos, tirar dúvidas sobre o cardápio e orientar como fazer o pedido pelo site.',
      'Não invente pratos ou preços que não estejam na lista. Se não souber, oriente a falar com um atendente.',
      'Se o cliente decidir comprar um produto, você PODE e DEVE adicionar ele ao carrinho informando no final da sua resposta o comando "[ADD:ID_DO_PRODUTO]". Por exemplo, se ele disser "quero um Temaki", responda algo gentil e inclua "[ADD:1234-5678-abcd]" se esse for o ID do Temaki.',
      '',
      'Cardápio disponível (ID do produto entre colchetes):',
      cardapio || '(cardápio ainda não cadastrado)',
    ].join('\n');
  }

  /** Verifica se o Ollama está acessível e quais modelos existem. */
  async status(): Promise<{ online: boolean; model: string; modelosDisponiveis?: string[] }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) return { online: false, model: this.model };
      const data = (await res.json()) as { models?: Array<{ name: string }> };
      return {
        online: true,
        model: this.model,
        modelosDisponiveis: (data.models ?? []).map((m) => m.name),
      };
    } catch {
      return { online: false, model: this.model };
    }
  }

  /**
   * Encaminha a conversa ao Ollama e devolve a resposta do assistente.
   * Se o Ollama estiver offline, retorna 503 com mensagem clara (o frontend
   * exibe um aviso amigável em vez de quebrar).
   */
  async responder(messages: ChatMessageDto[]): Promise<{ role: 'assistant'; content: string }> {
    const payload = {
      model: this.model,
      stream: false,
      messages: [
        { role: 'system', content: await this.promptSistema() },
        ...messages,
      ],
    };

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000),
      });
    } catch (err) {
      this.logger.warn(`Ollama indisponível em ${this.baseUrl}: ${err}`);
      throw new ServiceUnavailableException(
        `O assistente local (Ollama) não está acessível em ${this.baseUrl}. ` +
          'Verifique se o Ollama está em execução (ollama serve) e o modelo baixado.',
      );
    }

    if (!res.ok) {
      const texto = await res.text().catch(() => '');
      this.logger.warn(`Ollama respondeu ${res.status}: ${texto}`);
      throw new ServiceUnavailableException(
        `Falha ao consultar o modelo (${this.model}). ` +
          'Confirme se o modelo foi baixado com "ollama pull ' + this.model + '".',
      );
    }

    const data = (await res.json()) as { message?: { content?: string } };
    return { role: 'assistant', content: data.message?.content?.trim() ?? '' };
  }
}
