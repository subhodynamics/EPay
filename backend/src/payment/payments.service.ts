import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CheckPaymentDto } from './dto/check-payment.dto';
import { catchError, firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PaymentsService {

  private readonly edvironCreatePaymentApiUrl = process.env.EDVIRON_CREATE_PAYMENT_API_URI;
  private readonly pgKey = process.env.PG_KEY;
  private readonly apiKey = process.env.PG_API_KEY;
  private readonly edvironCheckPaymentApiUrl = process.env.EDVIRON_CHECK_PAYMENT_API_URI;
  // private readonly defaultcallback_url = process.env.CALLBACK_URL;

  constructor(private readonly httpService: HttpService) {} // contructor for http dependency injection

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    try {
      // Validate environment variables
      if (!this.edvironCreatePaymentApiUrl || !this.pgKey || !this.apiKey) {
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
        this.httpService.post(this.edvironCreatePaymentApiUrl, requestBody, {
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

  // Check Payment ka Async function

  async checkPayment(checkPaymentDto: CheckPaymentDto): Promise<any> {
    try {
      if (!this.edvironCheckPaymentApiUrl || !this.pgKey || !this.apiKey) {
        throw new HttpException('Missing payment gateway configuration', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Generate JWT
      const sign = jwt.sign(
        {
          school_id: checkPaymentDto.school_id,
          collect_request_id: checkPaymentDto.collect_request_id,
        },
        this.pgKey,
      );

      // Encode components
      const collectRequestId = encodeURIComponent(checkPaymentDto.collect_request_id);
      const schoolId = encodeURIComponent(checkPaymentDto.school_id);
      const encodedSign = encodeURIComponent(sign);

      // Build URL
      const apiUrl = `${this.edvironCheckPaymentApiUrl}/${collectRequestId}?school_id=${schoolId}&sign=${encodedSign}`;

      // Make request
      const { data } = await firstValueFrom(
        this.httpService
          .get(apiUrl, {
            headers: { Authorization: `Bearer ${this.apiKey}` },
          })
          .pipe(
            catchError((error) => {
              throw new HttpException(
                error.response?.data || 'Payment check failed',
                error.response?.status || HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      throw new HttpException(
        error.message || 'Payment check failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}