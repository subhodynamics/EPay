import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookLogService } from '../webhook-logs/webhook-logs.service';
import { OrderStatusService } from '../order-status/orders-status.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusEnum } from '../order-status/orders-status.enum';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookLogService: WebhookLogService,
    private readonly orderStatusService: OrderStatusService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    try {
      // 1. Extract data from payload
      const collectRequestId = payload.collect_request_id;
      const status = payload.status === 'success' ? 200 : 400;
      const transactionAmount = payload.amount;
      const gatewayName = payload.gateway_name;
      
      // 2. Find the order by collect_request_id
      const order = await this.ordersService.findOrderByCollectRequestId(collectRequestId) as { _id: string };
      
      if (!order) {
        throw new Error(`Order not found for collect_request_id: ${collectRequestId}`);
      }
      
      // 3. Update the order with gateway info
      await this.ordersService.updateOrderWithWebhookInfo(collectRequestId, gatewayName);
      
      // 4. Update order status
      await this.orderStatusService.updateByCollectRequestId(collectRequestId, {
        status: payload.status === 'success' ? OrderStatusEnum.COMPLETED : OrderStatusEnum.FAILED,
        transaction_amount: transactionAmount,
        payment_details: JSON.stringify(payload.payment_details || {}),
        payment_time: new Date(),
        payment_message: payload.message || '',
      });
      
      // 5. Log webhook
      await this.webhookLogService.createWebhookLog({
        collect_id: order._id.toString(),
        status: status,
        payload: payload,
      });
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      // Log error but still return 200 to the payment gateway
      await this.webhookLogService.createWebhookLog({
        collect_id: payload.collect_request_id || 'unknown',
        status: 500,
        payload: payload,
        error_message: error.message,
      });
      
      // Return 200 OK to avoid the payment gateway retrying
      return { success: false, message: 'Webhook processing failed but acknowledged' };
    }
  }
}