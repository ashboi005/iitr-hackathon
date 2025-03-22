from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# target_metadata = None
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models import Base
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# Parse the URL to handle SSL mode properly
parsed_url = urlparse(DATABASE_URL)
query_params = parse_qs(parsed_url.query)

# For Alembic migrations (sync), ensure we're using the standard psycopg2 driver
SYNC_DATABASE_URL = DATABASE_URL
if "postgresql+asyncpg://" in SYNC_DATABASE_URL:
    SYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

# Override sqlalchemy.url with synchronous DATABASE_URL
config.set_main_option("sqlalchemy.url", SYNC_DATABASE_URL)

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Handle SSL configuration for synchronous connection
    engine_config = config.get_section(config.config_ini_section)
    if 'sslmode' in query_params:
        engine_config['sqlalchemy.connect_args'] = {'sslmode': query_params['sslmode'][0]}

    connectable = engine_from_config(
        engine_config,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
