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
            // Extract data from webhook's payload (nested order_info)
            const orderInfo = payload.order_info;
            if (!orderInfo) {
                throw new Error('Invalid payload: order_info is missing');
            }

            // Idempotency check
            const indempotencyKey = `${orderInfo.order_id}`;
            const existingLog = await this.webhookLogService.findByIndempotencyKey(indempotencyKey);
            if (existingLog && existingLog.processed) {
                console.warn(`Webhook already processed for collect_id: ${orderInfo.order_id}`);
                return {
                    success: true,
                    message: 'Webhook already processed',
                    alreadyProcessed: true,
                };
            }

            // Extract collect_id and transactionId from order_id
            const [collectId, transactionId] = orderInfo.order_id.split('/');
            if (!collectId || !transactionId) {
                throw new Error('Invalid payload: collect_id or transaction_id is missing');
            }

            // Find collect_id -> collect_request_id
            const order = await this.ordersService.findOrderByCollectRequestId(collectId) as { _id: string };
            if (!order) {
                throw new Error(`Order not found for collect_id: ${collectId}`);
            }

            // Update the order with gateway info
            await this.ordersService.updateOrderWithWebhookInfo(collectId, orderInfo.gateway_name);

            // Update the status
            await this.orderStatusService.updateByCollectId(collectId, {
                status: orderInfo.status === 'success' ? OrderStatusEnum.COMPLETED : OrderStatusEnum.FAILED,
                transaction_amount: orderInfo.transaction_amount,
                payment_details: orderInfo.payment_details,
                payment_time: new Date(orderInfo.payment_time),
                payment_message: orderInfo.Payment_message,
                payment_mode: orderInfo.payment_mode,
                bank_reference: orderInfo.bank_reference,
                error_message: orderInfo.error_message !== 'NA' ? orderInfo.error_message : undefined,
            });

            // Save webhook log with processed = false
            const webhookLog = await this.webhookLogService.createWebhookLog({
                collect_id: collectId, // Use collect_request_id from the payload
                status: payload.status,
                payload: payload,
                idempotency_key: indempotencyKey,
                processed: false,
            });

            // Mark the webhook log as processed
            if (webhookLog && webhookLog._id) {
                const webhookLogId = typeof webhookLog._id === 'string' ? webhookLog._id : webhookLog._id.toString();
                await this.webhookLogService.markAsProcessedAtomically(webhookLogId);
            } else {
                console.error('Failed to mark webhook as processed: Missing webhookLog._id');
            }

            return { success: true, message: 'Webhook processed successfully' };
        } catch (error) {
            try {
                // Re-extract collectId from payload
                const collectRequestId = payload?.order_info?.order_id?.split('/')?.[0];
                if (!collectRequestId) {
                    console.error('Invalid payload: collect_request_id is missing');
                    return;
                }

                // Try to find an existing order first
                const orderObject = await this.ordersService.findOrderByCollectRequestId(collectRequestId);
                if (orderObject) {
                    await this.webhookLogService.createWebhookLog({
                        collect_id: collectRequestId, // Use collect_request_id from the payload
                        status: payload?.status || 500,
                        payload: payload,
                        idempotency_key: payload?.order_info?.order_id || `error-${Date.now()}`,
                        error_message: error.message,
                    });
                } else {
                    console.error('Cannot log webhook error: Order not found for', collectRequestId);
                }
            } catch (logError) {
                console.error('Failed to log webhook error:', logError.message);
            }
        }

        // Return 200 OK to avoid the payment gateway retrying
        return { success: false, message: 'Webhook processing failed but acknowledged' };
    }
}