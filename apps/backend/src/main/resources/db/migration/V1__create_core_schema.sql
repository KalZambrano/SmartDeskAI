-- SmartDesk AI · esquema inicial.
-- Los valores de enumeración se validan con CHECK y se leen como texto desde JPA.

CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_email_lowercase CHECK (email = lower(email)),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'TECHNICIAN', 'REQUESTER'))
);

CREATE TABLE categories (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        VARCHAR(80) NOT NULL,
    code        VARCHAR(30) NOT NULL,
    description VARCHAR(255),
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_categories_name UNIQUE (name),
    CONSTRAINT uq_categories_code UNIQUE (code)
);

CREATE TABLE technician_specialties (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    technician_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    category_id   BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    CONSTRAINT uq_technician_specialties UNIQUE (technician_id, category_id)
);

CREATE SEQUENCE ticket_code_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE tickets (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_code              VARCHAR(20)   NOT NULL,
    title                    VARCHAR(150)  NOT NULL,
    description              VARCHAR(4000) NOT NULL,
    category_id              BIGINT REFERENCES categories (id),
    priority                 VARCHAR(10)   NOT NULL DEFAULT 'MEDIUM',
    status                   VARCHAR(20)   NOT NULL DEFAULT 'OPEN',
    requester_id             BIGINT        NOT NULL REFERENCES users (id),
    assigned_technician_id   BIGINT REFERENCES users (id),
    ai_summary               VARCHAR(500),
    ai_suggested_response    VARCHAR(2000),
    ai_classification_source VARCHAR(10)   NOT NULL DEFAULT 'NONE',
    due_at                   TIMESTAMPTZ   NOT NULL,
    resolved_at              TIMESTAMPTZ,
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_tickets_ticket_code UNIQUE (ticket_code),
    CONSTRAINT ck_tickets_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT ck_tickets_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED')),
    CONSTRAINT ck_tickets_ai_source CHECK (ai_classification_source IN ('AI', 'RULES', 'NONE'))
);

CREATE TABLE ticket_comments (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id  BIGINT        NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    author_id  BIGINT        NOT NULL REFERENCES users (id),
    content    VARCHAR(2000) NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE ticket_history (
    id          BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id   BIGINT       NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
    actor_id    BIGINT       REFERENCES users (id) ON DELETE SET NULL,
    event_type  VARCHAR(40)  NOT NULL,
    old_value   VARCHAR(255),
    new_value   VARCHAR(255),
    description VARCHAR(500) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    ticket_id  BIGINT REFERENCES tickets (id) ON DELETE CASCADE,
    title      VARCHAR(150) NOT NULL,
    message    VARCHAR(500) NOT NULL,
    read_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE automation_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id       BIGINT REFERENCES tickets (id) ON DELETE SET NULL,
    automation_type VARCHAR(40) NOT NULL,
    execution_key   VARCHAR(120),
    status          VARCHAR(20) NOT NULL,
    details         VARCHAR(1000),
    executed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_automation_logs_execution_key UNIQUE (execution_key)
);

CREATE INDEX idx_tickets_status     ON tickets (status);
CREATE INDEX idx_tickets_priority   ON tickets (priority);
CREATE INDEX idx_tickets_category   ON tickets (category_id);
CREATE INDEX idx_tickets_requester  ON tickets (requester_id);
CREATE INDEX idx_tickets_technician ON tickets (assigned_technician_id);
CREATE INDEX idx_tickets_due_at     ON tickets (due_at);
CREATE INDEX idx_tickets_created_at ON tickets (created_at);
CREATE INDEX idx_comments_ticket    ON ticket_comments (ticket_id, created_at);
CREATE INDEX idx_history_ticket     ON ticket_history (ticket_id, created_at);
CREATE INDEX idx_notifications_user ON notifications (user_id, read_at);
CREATE INDEX idx_automation_ticket  ON automation_logs (ticket_id);
