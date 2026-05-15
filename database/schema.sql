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

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  clerk_user_id VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(320),
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  daily_token_budget INTEGER NOT NULL DEFAULT 100000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users(created_at);

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL DEFAULT 'Untitled chat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS ix_chats_created_at ON chats(created_at);

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  graph JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS ix_workflows_created_at ON workflows(created_at);

CREATE TABLE IF NOT EXISTS routing_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  task_type VARCHAR(40) NOT NULL,
  complexity VARCHAR(24) NOT NULL,
  selected_model VARCHAR(120) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  confidence DOUBLE PRECISION NOT NULL,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_routing_logs_user_id ON routing_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_routing_logs_task_type ON routing_logs(task_type);
CREATE INDEX IF NOT EXISTS ix_routing_logs_complexity ON routing_logs(complexity);
CREATE INDEX IF NOT EXISTS ix_routing_logs_selected_model ON routing_logs(selected_model);
CREATE INDEX IF NOT EXISTS ix_routing_logs_provider ON routing_logs(provider);
CREATE INDEX IF NOT EXISTS ix_routing_logs_created_at ON routing_logs(created_at);

CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_name VARCHAR(120) NOT NULL,
  metric_value DOUBLE PRECISION NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS ix_analytics_metric_name ON analytics(metric_name);
CREATE INDEX IF NOT EXISTS ix_analytics_captured_at ON analytics(captured_at);

CREATE TABLE IF NOT EXISTS token_usage (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  estimated_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT uq_token_usage_user_day UNIQUE(user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS ix_token_usage_user_id ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS ix_token_usage_usage_date ON token_usage(usage_date);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(40) NOT NULL,
  key_hash VARCHAR(128) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  last_four VARCHAR(8) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS ix_api_keys_provider ON api_keys(provider);
CREATE INDEX IF NOT EXISTS ix_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS ix_api_keys_created_at ON api_keys(created_at);

CREATE TABLE IF NOT EXISTS model_metrics (
  id UUID PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  model_name VARCHAR(120) NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  average_latency_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_model_metric_provider_model UNIQUE(provider, model_name)
);

CREATE INDEX IF NOT EXISTS ix_model_metrics_provider ON model_metrics(provider);
CREATE INDEX IF NOT EXISTS ix_model_metrics_model_name ON model_metrics(model_name);
