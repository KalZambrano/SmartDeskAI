ALTER TABLE tickets
    ADD COLUMN ai_suggested_category_id BIGINT REFERENCES categories (id),
    ADD COLUMN ai_suggested_priority VARCHAR(10),
    ADD COLUMN ai_reason VARCHAR(500);

ALTER TABLE tickets
    ADD CONSTRAINT ck_tickets_ai_suggested_priority
        CHECK (ai_suggested_priority IS NULL OR ai_suggested_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
