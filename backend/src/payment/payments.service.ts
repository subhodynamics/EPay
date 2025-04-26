import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  private readonly edvironApiUrl = process.env.EDVIRON_API_URI;
  private readonly pgKey = process.env.PG_KEY;
  private readonly apiKey = process.env.PG_API_KEY;
  private readonly defaultcallback_url = process.env.CALLBACK_URL;

  constructor(private readonly httpService: HttpService) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    try {
      // Validate environment variables
      if (!this.edvironApiUrl || !this.pgKey || !this.apiKey) {
        throw new HttpException('Missing payment gateway configuration', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Generate JWT signature
      const sign = createPaymentDto.generateSignature(this.pgKey);

      // Prepare request body
      const requestBody = {
        school_id: createPaymentDto.school_id,
        amount: createPaymentDto.amount,
        callback_url: createPaymentDto.callback_url,
        sign
      };

      // Make API call -> here i am sending the requstbody to the payment gateway and expecting collect-request-url
      const { data } = await firstValueFrom(
        this.httpService.post(this.edvironApiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }).pipe(
          catchError(error => {
            throw new HttpException(
              error.response?.data || 'Payment gateway error',
              error.response?.status || HttpStatus.BAD_REQUEST
            );
          })
        )
      );

      return data;
    } catch (error) {
      throw new HttpException(
        error.message || 'Payment processing failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}