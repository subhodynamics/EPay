@Post('webhook')
async handleWebhook(@Body() payload: WebhookPayload) {
  await this.orderStatusService.updateStatus(payload);
  return { status: 'OK' };
}