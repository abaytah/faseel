export interface SmsService {
  sendOtp(phone: string, code: string): Promise<boolean>;
}

class UnifonicSmsService implements SmsService {
  private apiKey: string;
  private senderId: string;

  constructor(apiKey: string, senderId = 'Faseel') {
    this.apiKey = apiKey;
    this.senderId = senderId;
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `رمز التحقق الخاص بك في فسيل: ${code}\nYour Faseel verification code: ${code}`;

    const response = await fetch('https://el.cloud.unifonic.com/rest/SMS/messages/Send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        AppSid: this.apiKey,
        SenderID: this.senderId,
        Body: message,
        Recipient: phone,
      }),
    });

    if (!response.ok) {
      console.error(`Unifonic SMS failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    return data?.success === true || data?.Status === 'Sent';
  }
}

class DevSmsService implements SmsService {
  async sendOtp(phone: string, code: string): Promise<boolean> {
    console.log(`[DEV SMS] OTP for ${phone}: ${code}`);
    return true;
  }
}

export function createSmsService(): SmsService {
  const apiKey = process.env.UNIFONIC_API_KEY;
  if (apiKey) {
    return new UnifonicSmsService(apiKey);
  }
  return new DevSmsService();
}
