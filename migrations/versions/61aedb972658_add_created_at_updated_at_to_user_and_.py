"""add created_at updated_at to User and Coach

Revision ID: 61aedb972658
Revises: 8904497fdc61
Create Date: 2024-08-13 14:24:46.202319

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '61aedb972658'
down_revision: Union[str, None] = '8904497fdc61'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('coach', sa.Column('created_at', sa.DateTime(), nullable=False))
    op.add_column('coach', sa.Column('updated_at', sa.DateTime(), nullable=False))
    op.add_column('user', sa.Column('created_at', sa.DateTime(), nullable=False))
    op.add_column('user', sa.Column('updated_at', sa.DateTime(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'updated_at')
    op.drop_column('user', 'created_at')
    op.drop_column('coach', 'updated_at')
    op.drop_column('coach', 'created_at')
    # ### end Alembic commands ###
