// import {
//   Controller,
//   Post,
//   Body,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import { WebhookService } from './webhook.service';
// import { WebhookPayloadDto } from './dto/webhook-payload.dto';

// @Controller('webhook')
// export class WebhookController {
//   constructor(private readonly webhookService: WebhookService) {}

//   @Post()
//   @HttpCode(HttpStatus.OK) // Webhooks typically expect a 200 OK response
//   async handleWebhook(@Body() payload: WebhookPayloadDto) {
//     await this.webhookService.handleWebhook(payload);
//     return { message: 'Webhook received successfully' };
//   }
// }