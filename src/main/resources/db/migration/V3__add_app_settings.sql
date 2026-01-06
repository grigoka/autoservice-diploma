CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY,
    version BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    mail_host VARCHAR(150),
    mail_port INTEGER,
    mail_username VARCHAR(150),
    mail_password VARCHAR(200),
    mail_from VARCHAR(150),
    notifications_enabled BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_app_settings_updated_at ON app_settings(updated_at);

