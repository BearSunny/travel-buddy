CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth0_id TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    display_name VARCHAR(255),
    avatar TEXT,
    updated_at TIMESTAMPTZ
);

INSERT INTO users (email, password, display_name)
VALUES ('lechihungdo@gmail.com', '123456789', 'Lê Chí Hưng');

INSERT INTO users (email, password, display_name)
VALUES ('huynhtanphuc@gmail.com', '987654321', 'Huỳnh Tấn Phúc');

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    CONSTRAINT fk_trips_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO trips (owner_id, title, description, start_date, end_date)
VALUES (
    (SELECT id FROM users WHERE email = 'lechihungdo@gmail.com'),
    'Hành trình Hội An',
    'Khám phá phổ cổ',
    '2025-11-15',
    '2025-11-17'
);

INSERT INTO trips (owner_id, title, description, start_date, end_date)
VALUES (
    (SELECT id FROM users WHERE email = 'huynhtanphuc@gmail.com'),
    'Hành trình Đà Nẵng',
    'Khám phá Mỹ Khê',
    '2025-11-15',
    '2025-11-17'
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collab_role') THEN
        CREATE TYPE collab_role AS ENUM ('viewer', 'editor', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collab_status') THEN
        CREATE TYPE collab_status AS ENUM ('invited', 'accepted', 'declined');
    END IF;
END$$;

CREATE TABLE trip_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role collab_role NOT NULL DEFAULT 'editor',
    status collab_status NOT NULL DEFAULT 'invited',
    invited_by UUID,
    CONSTRAINT fk_tc_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tc_inviter FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uc_trip_user UNIQUE (trip_id, user_id)
);

INSERT INTO trip_collaborators (trip_id, user_id, role, status, invited_by)
VALUES (
    (SELECT id FROM trips WHERE title = 'Hành trình Hội An'),
    (SELECT id FROM users WHERE email = 'huynhtanphuc@gmail.com'),
    'viewer',
    'invited',
    (SELECT id FROM users WHERE email = 'lechihungdo@gmail.com')
);

INSERT INTO trip_collaborators (trip_id, user_id, role, status, invited_by)
VALUES (
    (SELECT id FROM trips WHERE title = 'Hành trình Đà Nẵng'),
    (SELECT id FROM users WHERE email = 'lechihungdo@gmail.com'),
    'editor',
    'accepted',
    (SELECT id FROM users WHERE email = 'huynhtanphuc@gmail.com')
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('planned','done','cancelled');
    END IF;
END$$;

CREATE TABLE trip_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    address VARCHAR(512),
    city VARCHAR(255),
    country VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status event_status NOT NULL DEFAULT 'planned',
    cost INTEGER DEFAULT 0,
    CONSTRAINT fk_te_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_te_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO trip_events (trip_id, creator_id, title, start_time, end_time)
VALUES (
    (SELECT id FROM trips WHERE title = 'Hành trình Đà Nẵng'),
    (SELECT id FROM users WHERE email = 'lechihungdo@gmail.com'),
    'Đi bộ phố cổ',
    '2025-11-15T08:30:00+07:00',
    '2025-11-15T11:30:00+07:00'
);

-- Trip Templates Table
CREATE TABLE trip_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_trip_id UUID,
    creator_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    category VARCHAR(100),
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_trip FOREIGN KEY (original_trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    CONSTRAINT fk_template_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Template Events (stores the itinerary structure)
CREATE TABLE template_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    day_number INTEGER NOT NULL,
    start_time TIME,
    end_time TIME,
    address VARCHAR(512),
    city VARCHAR(255),
    country VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    order_index INTEGER DEFAULT 0,
    CONSTRAINT fk_te_template FOREIGN KEY (template_id) REFERENCES trip_templates(id) ON DELETE CASCADE
);

-- Template Ratings
CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_template FOREIGN KEY (template_id) REFERENCES trip_templates(id) ON DELETE CASCADE,
    CONSTRAINT fk_rating_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uc_template_user_rating UNIQUE (template_id, user_id)
);