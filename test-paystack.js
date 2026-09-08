const axios = require('axios');

async function testPayment() {
  try {
    const response = await axios.post('http://localhost:3000/api/paystack/init', {
      email: 'test@example.com',
      amount: 35.00,
      phone: '0241234567'
    });
    console.log('Success! Paystack Response:', response.data);
  } catch (error) {
    console.error('Error testing payment:', error.response?.data || error.message);
  }
}

testPayment();