"""removed contract_address

Revision ID: 6c56371c5dfa
Revises: c67fed72f2c7
Create Date: 2025-03-22 20:09:36.419718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6c56371c5dfa'
down_revision: Union[str, None] = 'c67fed72f2c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('gigs', 'contract_address')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('gigs', sa.Column('contract_address', sa.VARCHAR(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
