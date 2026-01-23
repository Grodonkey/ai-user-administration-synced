"""add projects table and is_starter field

Revision ID: 002_projects
Revises: 001_magic_link
Create Date: 2026-01-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_projects'
down_revision: Union[str, None] = '001_magic_link'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_starter column to users
    op.add_column('users', sa.Column('is_starter', sa.Boolean(), nullable=True, server_default='false'))

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('short_description', sa.String(500), nullable=True),
        sa.Column('funding_goal', sa.Numeric(12, 2), nullable=True),
        sa.Column('funding_current', sa.Numeric(12, 2), server_default='0'),
        sa.Column('status', sa.String(50), server_default='draft'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('financing_start', sa.DateTime(timezone=True), nullable=True),
        sa.Column('financing_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('video_url', sa.String(500), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_projects_id', 'projects', ['id'])
    op.create_index('ix_projects_slug', 'projects', ['slug'], unique=True)
    op.create_index('ix_projects_owner_id', 'projects', ['owner_id'])
    op.create_index('ix_projects_status', 'projects', ['status'])


def downgrade() -> None:
    op.drop_index('ix_projects_status', table_name='projects')
    op.drop_index('ix_projects_owner_id', table_name='projects')
    op.drop_index('ix_projects_slug', table_name='projects')
    op.drop_index('ix_projects_id', table_name='projects')
    op.drop_table('projects')
    op.drop_column('users', 'is_starter')
