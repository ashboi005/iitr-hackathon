import pusher
from dotenv import load_dotenv
import os

load_dotenv()

pusher_client = pusher.Pusher(
    app_id=os.getenv('PUSHER_APP_ID'),
    key=os.getenv('PUSHER_KEY'),
    secret=os.getenv('PUSHER_SECRET'),
    cluster=os.getenv('PUSHER_CLUSTER'),
    ssl=True
)

def trigger_message(ticket_id, message_data):
    pusher_client.trigger(
        f"ticket-{ticket_id}",
        'new-message',
        message_data
    )