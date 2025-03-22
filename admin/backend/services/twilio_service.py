from twilio.rest import Client
import os

class TwilioService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.client = Client(self.account_sid, self.auth_token)

    def send_sms(self, to_number, message):
        try:
            self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=self._format_number(to_number)
            return True
        except Exception as e:
            print(f"Twilio error: {str(e)}")
            return False

    def _format_number(self, number):
        return number if number.startswith('+') else f'+{number}'

twilio_service = TwilioService()