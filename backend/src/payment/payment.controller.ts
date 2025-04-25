@Post('create-payment')
async createPayment(@Body() dto: CreatePaymentDto) {
  const token = jwt.sign(
    { amount: dto.amount, school_id: process.env.SCHOOL_ID },
    process.env.PG_KEY,
  );
  const response = await axios.post('PAYMENT_API_URL', { signed_payload: token });
  return { payment_url: response.data.payment_url };
}