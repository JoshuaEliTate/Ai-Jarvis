DROP DATABASE IF EXISTS aiJarvis_db;

CREATE DATABASE aiJarvis_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    prompt TEXT NOT NULL,
    response TEXT NOT NULL
);