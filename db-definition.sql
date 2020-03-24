/*
**  Database structure definition (PostgreSQL)
*/

CREATE
  TABLE  users
    ( id        SERIAL PRIMARY KEY
    , name      VARCHAR(100)
    , email     TEXT UNIQUE NOT NULL
    , entries   BIGINT NOT NULL SET DEFAULT 0
    , joined    TIMESTAMP NOT NULL
    );

CREATE
  TABLE  login
    ( id        SERIAL PRIMARY KEY
    , hash      VARCHAR(100) NOT NULL
    , email     TEXT UNIQUE NOT NULL
    );