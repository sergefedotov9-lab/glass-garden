CREATE TABLE garden_players (
  user_id TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  state TEXT NOT NULL
);
