CREATE TABLE IF NOT EXISTS conversation_turns (
  id UUID PRIMARY KEY,
  conversation_id VARCHAR(80) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  task_type VARCHAR(40) NOT NULL,
  complexity VARCHAR(24) NOT NULL,
  model_used VARCHAR(80) NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  validation JSONB NOT NULL DEFAULT '{}'::jsonb,
  workflow_trace JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_conversation_turns_conversation_id ON conversation_turns(conversation_id);
CREATE INDEX IF NOT EXISTS ix_conversation_turns_model_used ON conversation_turns(model_used);
CREATE INDEX IF NOT EXISTS ix_conversation_turns_complexity ON conversation_turns(complexity);
CREATE INDEX IF NOT EXISTS ix_conversation_turns_task_type ON conversation_turns(task_type);
CREATE INDEX IF NOT EXISTS ix_conversation_turns_created_at ON conversation_turns(created_at);

