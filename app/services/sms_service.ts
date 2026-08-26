// app/services/sms_service.ts

export default class SmsService {
  private url = 'https://www.proactivesms.in/REST/sendsms'
  private user = 'digibima'
  private password = 'a145a99c2cXX' // Apni actual API password key yahan replace karein
  private senderId = 'DGBIMA'
  private tempId = '1407172985653417707'

  async sendOtpSms(mobile: string, otp: string): Promise<boolean> {
    try {
      // Mobile number agar 10 digit ka hai toh aage 91 ensure karein ya standard format rakhein
      const formattedMobile = mobile.length === 10 ? `91${mobile}` : mobile

      const smsText = `Dear Patron,\n\nYour verification OTP is: ${otp}\n\nTeam Digibima`

      const payload = {
        user: this.user,
        password: this.password,
        listsms: [
          {
            sms: smsText,
            mobiles: formattedMobile,
            senderid: this.senderId,
            tempid: this.tempId,
          },
        ],
      }

      const response = await fetch(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log('📡 ProactiveSMS Response:', data)
      return true
    } catch (error) {
      console.error('❌ ProactiveSMS Failed:', error)
      return false
    }
  }
}