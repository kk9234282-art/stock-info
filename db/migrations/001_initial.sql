CREATE TABLE companies(id text PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL, isin text UNIQUE, sector text, industry text, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX company_name_idx ON companies(name);
CREATE TABLE listings(id text PRIMARY KEY,company_id text NOT NULL REFERENCES companies(id) ON DELETE CASCADE,exchange text NOT NULL CHECK(exchange IN ('NSE','BSE')),symbol text NOT NULL,UNIQUE(exchange,symbol));
CREATE INDEX listing_company_idx ON listings(company_id);
CREATE TABLE research(id text PRIMARY KEY,company_id text NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,draft jsonb NOT NULL,published jsonb,version integer NOT NULL DEFAULT 0,updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE revisions(id text PRIMARY KEY,research_id text NOT NULL REFERENCES research(id) ON DELETE CASCADE,version integer NOT NULL,action text NOT NULL,content jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(research_id,version));
CREATE TABLE import_batches(id text PRIMARY KEY,digest text NOT NULL UNIQUE,source text NOT NULL,status text NOT NULL DEFAULT 'staged',rows jsonb NOT NULL,summary jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
