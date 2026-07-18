import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto';

/**
 * Chat de atendimento (substitui o WhatsApp). Público: o cliente conversa
 * antes mesmo de logar, como faria no WhatsApp do restaurante.
 */
@Controller('chat')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get('status')
  status() {
    return this.service.status();
  }

  @Post()
  responder(@Body() dto: ChatRequestDto) {
    return this.service.responder(dto.messages);
  }
}
