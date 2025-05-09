"""added freelancer_wallet_address field to gig request

Revision ID: b9445b67ffc8
Revises: ae7712c7868b
Create Date: 2025-03-23 00:45:35.547010

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9445b67ffc8'
down_revision: Union[str, None] = 'ae7712c7868b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('gig_requests', sa.Column('freelancer_wallet_address', sa.String(), nullable=True))
    op.create_index(op.f('ix_gig_requests_freelancer_wallet_address'), 'gig_requests', ['freelancer_wallet_address'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_gig_requests_freelancer_wallet_address'), table_name='gig_requests')
    op.drop_column('gig_requests', 'freelancer_wallet_address')
    # ### end Alembic commands ###
