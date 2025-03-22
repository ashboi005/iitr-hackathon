from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs

load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse the URL to handle SSL mode properly
parsed_url = urlparse(DATABASE_URL)
query_params = parse_qs(parsed_url.query)

# Remove sslmode from the URL if present
if 'sslmode' in query_params:
    del query_params['sslmode']

# Reconstruct the URL without sslmode
clean_url = f"{parsed_url.scheme}://{parsed_url.netloc}{parsed_url.path}"
if query_params:
    clean_url += '?' + '&'.join(f"{k}={v[0]}" for k, v in query_params.items())

# For FastAPI (async)
ASYNC_DATABASE_URL = clean_url.replace("postgresql://", "postgresql+asyncpg://")

# Create async SQLAlchemy engine with SSL configuration
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,
    connect_args={
        "ssl": True
    } if parsed_url.query and 'sslmode' in parse_qs(parsed_url.query) else {}
)

# Create AsyncSessionLocal class
AsyncSessionLocal = sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Create Base class
Base = declarative_base()

# Dependency for async operations
async def get_db():
    async_session = AsyncSessionLocal()
    try:
        yield async_session
    finally:
        await async_session.close() 