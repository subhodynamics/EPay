import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookLogService } from '../webhook-logs/webhook-logs.service';
import { OrderStatusService } from '../order-status/orders-status.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusEnum } from '../order-status/orders-status.enum';

@Controller('webhook')
export class WebhookController {
    constructor(
        private readonly webhookLogService: WebhookLogService, // logging service
        private readonly orderStatusService: OrderStatusService, // status updating service -> changes in order status table
        private readonly ordersService: OrdersService, // order updating service -> changes in order table
    ) { }

    @Post()
    @HttpCode(HttpStatus.OK) // Return 200 OK to avoid the payment gateway retrying
    async handleWebhook(@Body() payload: any) {
        try {
            // Extract data from webhook's payload (nested order_info)
            const orderInfo = payload.order_info;
            if (!orderInfo) {
                throw new Error('Invalid payload: order_info is missing');
            }

            // extract collect_id and tranactionId from order_id (collect_id/transaction_id -> inside order_info -> order_id)
            const [ collectId, tranactionId ] = orderInfo.order_id.split('/');
            if (!collectId || !tranactionId) {
                throw new Error('Invalid payload: collect_id or transaction_id is missing');
            }

            // find collect_id -> collect_request_id
            const order = await this.ordersService.findOrderByCollectRequestId(collectId) as { _id: string };

            if (!order) {
                throw new Error(`Order not found for collect_id: ${collectId}`);
            }

            // update thie order with gateway info
            await this.ordersService.updateOrderWithWebhookInfo(collectId, orderInfo.gateway_name);

            // update the status
            await this.orderStatusService.updateByCollectId(collectId, {
                status: orderInfo.status === 'success' ? OrderStatusEnum.COMPLETED : OrderStatusEnum.FAILED,
                transaction_amount: orderInfo.transaction_amount,
                payment_details: orderInfo.payment_details,
                payment_time: new Date(orderInfo.payment_time),
                payment_message: orderInfo.Payment_message,
                payment_mode: orderInfo.pyament_mode,
                bank_reference: orderInfo.bank_reference,
                error_message: orderInfo.error_message !=='NA' ? orderInfo.error_message : undefined,
            });

            // webhook log
            await this.webhookLogService.createWebhookLog({
                collect_id: order._id.toString(),
                status: payload.status,
                payload: payload,
            });
            return { success: true, message: 'Webhook processed successfully' };
        } catch (error) {

            try {

                const collectId = payload?.order_info?.order_id.split('/')?.[0];

                if (collectId) {
                    await this.webhookLogService.createWebhookLog({
                        collect_id: collectId,
                        status: payload.status,
                        payload: payload,
                        error_message: error.message,
                    });
                } else {
                    console.error('cannot log webhook wrror : Invalid collect_id ', error.message);
                }
            } catch (logError) {
                console.error('Failed to log webhook error:', logError.message);
            }
        }

        // Return 200 OK to avoid the payment gateway retrying
        return { success: false, message: 'Webhook processing failed but acknowledged' };
    }
}