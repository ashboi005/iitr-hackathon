import os
from dotenv import load_dotenv
load_dotenv() 

import boto3
from uuid import uuid4
from botocore.exceptions import NoCredentialsError
from fastapi import UploadFile, HTTPException, status

AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME")
AWS_CLOUDFRONT_URL = os.getenv("AWS_CLOUDFRONT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")


# Validate AWS environment variables
if not AWS_REGION or not AWS_S3_BUCKET_NAME:
    print("WARNING: AWS_REGION or AWS_S3_BUCKET_NAME environment variables are missing. File uploads will fail.")

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    print("WARNING: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY environment variables are missing. File uploads will fail.")

# Initialize S3 client only if credentials are available
s3_client = None
try:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION,
    )
    # Test connection
    s3_client.list_buckets()
    print("Successfully connected to AWS S3")
except Exception as e:
    print(f"Failed to initialize S3 client: {str(e)}")

def upload_image_to_s3(file: UploadFile, folder="general"):
    """
    Upload an image file to AWS S3 and return its CloudFront URL.
    
    Args:
        file (UploadFile): The image file to upload
        folder (str): Folder path within the S3 bucket (e.g., "profiles", "milestones")
        
    Returns:
        str: The CloudFront URL or S3 URL of the uploaded image
        
    Raises:
        HTTPException: If upload fails or credentials are invalid
    """
    # Check if S3 client is initialized
    if s3_client is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS S3 client not initialized. Check AWS credentials and region settings."
        )
    
    # Check if required AWS variables are set
    if not AWS_REGION or not AWS_S3_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS_REGION or AWS_S3_BUCKET_NAME environment variables are missing"
        )
    
    # Check if file is None or empty
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file provided"
        )
    
    try:
        # Validate file type
        content_type = file.content_type
        if not content_type or not content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{folder}/{uuid4().hex}.{file_extension}"

        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": content_type}
        )

        # Generate URL
        url = (f"{AWS_CLOUDFRONT_URL}/{unique_filename}"
               if AWS_CLOUDFRONT_URL
               else f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}")
        
        return url

    except NoCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AWS credentials are invalid or not found. Make sure the access key ID and secret key are correct."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading image: {str(e)}"
        )

def is_url(text):
    """
    Check if a string is a URL
    
    Args:
        text (str): Text to check
        
    Returns:
        bool: True if text is a URL, False otherwise
    """
    return text.startswith(('http://', 'https://')) 