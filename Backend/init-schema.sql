-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    dept_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    responsible_empl_id BIGINT
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    empl_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    dept_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    asset_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    serial_number VARCHAR(255),
    status VARCHAR(255),
    empl_id BIGINT NOT NULL,
    last_updated TIMESTAMP(6),
    FOREIGN KEY (empl_id) REFERENCES employees(empl_id)
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(255) NOT NULL CHECK (status IN ('NEW','IN_REVIEW','IN_PROGRESS','RESOLVED','REJECTED','CLOSED')),
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    asset_id BIGINT NOT NULL,
    empl_id BIGINT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (empl_id) REFERENCES employees(empl_id)
);

-- Complaint workflows table
CREATE TABLE IF NOT EXISTS complaint_workflows (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    old_status VARCHAR(255) CHECK (old_status IN ('NEW','IN_REVIEW','IN_PROGRESS','RESOLVED','REJECTED','CLOSED')),
    current_status VARCHAR(255) NOT NULL CHECK (current_status IN ('NEW','IN_REVIEW','IN_PROGRESS','RESOLVED','REJECTED','CLOSED')),
    reason TEXT,
    changed_at TIMESTAMP(6) NOT NULL,
    empl_id BIGINT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (empl_id) REFERENCES employees(empl_id)
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    request_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(255) NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','COMPLETED')),
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    asset_id BIGINT,
    empl_id BIGINT NOT NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    FOREIGN KEY (empl_id) REFERENCES employees(empl_id)
);

-- Tasks table (polymorphic - tracks acceptances)
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(255) NOT NULL,
    item_id BIGINT NOT NULL,
    accepted_by BIGINT NOT NULL,
    accepted_at TIMESTAMP(6) NOT NULL,
    status VARCHAR(255) NOT NULL,
    FOREIGN KEY (accepted_by) REFERENCES employees(empl_id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP(6),
    created_at TIMESTAMP(6)
);

-- Users table for JWT authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('EMPLOYEE', 'DEPT_RESPONSIBLE', 'ADMIN')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    CONSTRAINT email_not_empty CHECK (email != '')
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    empl_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP(6) NOT NULL,
    FOREIGN KEY (empl_id) REFERENCES employees(empl_id)
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_empl_id ON notifications(empl_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Seed default users (password: password123 hashed with BCrypt cost factor 12)
INSERT INTO users (email, name, password_hash, department, role, active) VALUES
(
    'admin@draxlmaier.com',
    'Admin User',
    '$2a$12$eIzt8BC3z7strxF.HcUPueQyBN7FjxLLmF5/xPKnzFxe6EjW8Qkri',
    'Administration',
    'ADMIN',
    true
),
(
    'jane@draxlmaier.com',
    'Jane Smith',
    '$2a$12$eIzt8BC3z7strxF.HcUPueQyBN7FjxLLmF5/xPKnzFxe6EjW8Qkri',
    'HR',
    'DEPT_RESPONSIBLE',
    true
),
(
    'john@draxlmaier.com',
    'John Doe',
    '$2a$12$eIzt8BC3z7strxF.HcUPueQyBN7FjxLLmF5/xPKnzFxe6EjW8Qkri',
    'IT',
    'EMPLOYEE',
    true
)
ON CONFLICT (email) DO NOTHING;
