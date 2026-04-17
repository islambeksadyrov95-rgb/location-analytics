-- Location Intelligence Pro — Database Schema
-- Neon PostgreSQL

-- Помещения с Крыши
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    krisha_id BIGINT UNIQUE,
    url TEXT,
    property_type VARCHAR(50),
    district VARCHAR(100),
    address TEXT,
    lat DECIMAL(10,7),
    lon DECIMAL(10,7),
    area_m2 INT,
    price_month BIGINT,
    price_per_m2 INT,
    floor INT,
    ceilings DECIMAL(3,1),
    condition VARCHAR(100),
    entrance VARCHAR(200),
    description TEXT,
    features JSONB DEFAULT '[]',
    phone VARCHAR(100),
    year_built INT,
    building_type VARCHAR(100),
    parsed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Фотографии помещений
CREATE TABLE IF NOT EXISTS listing_photos (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- Заведения из 2ГИС (конкуренты, кафе, рестораны)
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    gis_id VARCHAR(200) UNIQUE,
    name VARCHAR(500),
    address TEXT,
    district VARCHAR(100),
    lat DECIMAL(10,7),
    lon DECIMAL(10,7),
    rubric_primary VARCHAR(200),
    rubric_all JSONB DEFAULT '[]',
    rating DECIMAL(2,1),
    review_count INT DEFAULT 0,
    avg_check INT,
    phones JSONB DEFAULT '[]',
    website TEXT,
    schedule JSONB,
    branch_count INT DEFAULT 1,
    parsed_at TIMESTAMP DEFAULT NOW()
);

-- Жилые здания (для расчёта населения)
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    gis_id VARCHAR(200),
    address TEXT,
    lat DECIMAL(10,7),
    lon DECIMAL(10,7),
    floors INT,
    apartments_count INT,
    total_area_m2 DECIMAL(10,1),
    est_population INT,
    building_type VARCHAR(50),
    year_built INT,
    parsed_at TIMESTAMP DEFAULT NOW()
);

-- Инфраструктура (остановки, БЦ, ТЦ, школы, госорганы)
CREATE TABLE IF NOT EXISTS infrastructure (
    id SERIAL PRIMARY KEY,
    gis_id VARCHAR(200),
    name VARCHAR(500),
    category VARCHAR(100),
    subcategory VARCHAR(200),
    lat DECIMAL(10,7),
    lon DECIMAL(10,7),
    address TEXT,
    extra JSONB DEFAULT '{}'
);

-- История цен (для отслеживания изменений)
CREATE TABLE IF NOT EXISTS prices (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    price_month BIGINT NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prices_listing ON prices(listing_id);

-- Индексы для быстрого радиусного поиска
CREATE INDEX IF NOT EXISTS idx_listings_coords ON listings(lat, lon);
CREATE INDEX IF NOT EXISTS idx_venues_coords ON venues(lat, lon);
CREATE INDEX IF NOT EXISTS idx_buildings_coords ON buildings(lat, lon);
CREATE INDEX IF NOT EXISTS idx_infrastructure_coords ON infrastructure(lat, lon);
CREATE INDEX IF NOT EXISTS idx_venues_rubric ON venues(rubric_primary);
CREATE INDEX IF NOT EXISTS idx_infrastructure_category ON infrastructure(category);
CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
