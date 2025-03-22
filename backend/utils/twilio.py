import os
from dotenv import load_dotenv
from twilio.rest import Client
from fastapi import HTTPException, status

# Load environment variables
load_dotenv()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
DEMO_RECIPIENT_NUMBER = os.getenv("DEMO_RECIPIENT_NUMBER")  # For development/demo

# Initialize Twilio client
client = None
try:
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as e:
    print(f"Failed to initialize Twilio client: {str(e)}")

async def send_sms(to_number=None, message=None):
    """
    Send an SMS using Twilio.
    
    Args:
        to_number (str): The recipient's phone number. Defaults to demo number.
        message (str): The message to send.
        
    Returns:
        bool: True if the message was sent successfully, False otherwise.
    """
    if not message:
        print("No message provided")
        return False
    
    # Use the demo number if no specific number is provided
    recipient = to_number or DEMO_RECIPIENT_NUMBER
    
    if not recipient:
        print("No recipient number provided and no demo number configured.")
        return False
    
    # Instead of actually sending SMS, just print to console
    print("\n-----SIMULATED SMS-----")
    print(f"TO: {recipient}")
    print(f"MESSAGE: {message}")
    print("-----END SMS-----\n")
    return True
    
    # Original code commented out:
    # try:
    #     # Send the message
    #     message = client.messages.create(
    #         body=message,
    #         from_=TWILIO_PHONE_NUMBER,
    #         to=recipient
    #     )
    #     print(f"SMS sent successfully. SID: {message.sid}")
    #     return True
    # except Exception as e:
    #     print(f"Failed to send SMS: {str(e)}")
    #     return False

# Notification functions for gig workflows

async def notify_employer_new_gig_request(employer_phone, freelancer_name, gig_title):
    """Notify employer about a new gig request."""
    message = f"New gig request! {freelancer_name} has applied for your gig: '{gig_title}'"
    return await send_sms(employer_phone, message)

async def notify_freelancer_gig_request_accepted(freelancer_phone, gig_title, employer_name):
    """Notify freelancer that their gig request was accepted."""
    message = f"Good news! {employer_name} has accepted your application for '{gig_title}'. The gig is now active."
    return await send_sms(freelancer_phone, message)

async def notify_freelancer_gig_request_rejected(freelancer_phone, gig_title, employer_name):
    """Notify freelancer that their gig request was rejected."""
    message = f"Your application for '{gig_title}' by {employer_name} was not accepted at this time."
    return await send_sms(freelancer_phone, message)

async def notify_employer_milestone_submitted(employer_phone, freelancer_name, gig_title, milestone_number):
    """Notify employer about a milestone submission."""
    message = f"{freelancer_name} has submitted milestone #{milestone_number} for '{gig_title}'. Please review it."
    return await send_sms(employer_phone, message)

async def notify_freelancer_milestone_approved(freelancer_phone, gig_title, milestone_number, payment_amount):
    """Notify freelancer about milestone approval and payment."""
    message = f"Milestone #{milestone_number} for '{gig_title}' has been approved! ${payment_amount} has been added to your balance."
    return await send_sms(freelancer_phone, message)

async def notify_freelancer_milestone_rejected(freelancer_phone, gig_title):
    """Notify freelancer about milestone rejection and gig termination."""
    message = f"Unfortunately, your milestone submission for '{gig_title}' was rejected and the gig has been terminated."
    return await send_sms(freelancer_phone, message)

async def notify_freelancer_gig_completed(freelancer_phone, gig_title, total_payment):
    """Notify freelancer about gig completion."""
    message = f"Congratulations! Your gig '{gig_title}' is now complete. You earned a total of ${total_payment}."
    return await send_sms(freelancer_phone, message)

async def notify_employer_gig_completed(employer_phone, gig_title, freelancer_name):
    """Notify employer about gig completion."""
    message = f"The gig '{gig_title}' with {freelancer_name} has been successfully completed!"
    return await send_sms(employer_phone, message) 