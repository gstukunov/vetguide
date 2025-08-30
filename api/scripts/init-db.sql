-- Database initialization script for VetGuide API
-- This script runs when the PostgreSQL container is first created

-- Create the database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create any additional schemas or configurations if needed
-- The application will handle table creation through TypeORM migrations

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'VetGuide database initialized successfully';
END $$;
