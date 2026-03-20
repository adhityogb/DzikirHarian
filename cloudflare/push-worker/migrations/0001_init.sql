CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint_hash TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL,
  subscription_json TEXT NOT NULL,
  timezone TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'id-ID',
  morning_hour INTEGER NOT NULL DEFAULT 5,
  morning_minute INTEGER NOT NULL DEFAULT 30,
  evening_hour INTEGER NOT NULL DEFAULT 17,
  evening_minute INTEGER NOT NULL DEFAULT 0,
  next_morning_at TEXT,
  next_evening_at TEXT,
  last_morning_sent_on TEXT,
  last_evening_sent_on TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_next_morning_at
  ON push_subscriptions (is_active, next_morning_at);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_next_evening_at
  ON push_subscriptions (is_active, next_evening_at);
