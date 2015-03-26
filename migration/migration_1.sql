DROP TABLE IF EXISTS printed_eans, things, things_log, blobs CASCADE;;

CREATE SEQUENCE ean_seq MINVALUE 40000000000 MAXVALUE 49999999999 START 40000200000;;
CREATE TABLE printed_eans (
	"id" bigint NOT NULL DEFAULT nextval('ean_seq') CONSTRAINT int52_js_compatible_id CHECK (0 < id AND id < 4503599627370496),
	CONSTRAINT "eans_pkey" PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE
);;
ALTER SEQUENCE ean_seq OWNED BY printed_eans.id;;

CREATE TABLE blobs (
	"id" char(64) NOT NULL,
	"content_type" varchar(50),
	"length" bigint,
	"content" bytea,
	CONSTRAINT "blobs_pkey_id" PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE
);;

CREATE SEQUENCE things_id_seq MINVALUE 1000000000100;;
CREATE TABLE things (
	"id" bigint NOT NULL DEFAULT nextval('things_id_seq') CONSTRAINT int52_js_compatible_id CHECK (0 < id AND id <= 4503599627370496),
	"parent_id" bigint,
	"author" varchar(255),
	"ip" varchar(255),
	"name" varchar(255),
	"description" text,
	"image_id" char(64),
	CONSTRAINT "things_pkey_id" PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE,
	CONSTRAINT "things_fk_parent_id" FOREIGN KEY ("parent_id") REFERENCES "things" ("id") ON UPDATE CASCADE ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
	CONSTRAINT "things_fk_image_id" FOREIGN KEY ("image_id") REFERENCES "blobs" ("id") ON UPDATE CASCADE ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);;
ALTER SEQUENCE things_id_seq OWNED BY things.id;;
CREATE TABLE things_log (
	"timestamp" timestamp NOT NULL,
	"id" bigint NOT NULL CONSTRAINT int52_js_compatible_id CHECK (0 < id AND id <= 4503599627370496),
	"parent_id" bigint,
	"author" varchar(255),
	"ip" varchar(255),
	"name" varchar(255),
	"description" text,
	"image_id" char(64),
	CONSTRAINT "things_log_pkey_id" PRIMARY KEY ("id", "timestamp") NOT DEFERRABLE INITIALLY IMMEDIATE,
	CONSTRAINT "things_log_fk_parent_id" FOREIGN KEY ("parent_id") REFERENCES "things" ("id") ON UPDATE CASCADE ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
	CONSTRAINT "things_log_fk_image_id" FOREIGN KEY ("image_id") REFERENCES "blobs" ("id") ON UPDATE CASCADE ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);;

CREATE OR REPLACE FUNCTION things_logger() RETURNS TRIGGER AS $body$
BEGIN
    IF (TG_OP = 'UPDATE' OR TG_OP = 'INSERT') THEN
    	DELETE FROM things_log
    		WHERE id = NEW.id
    		  AND timestamp >= date_trunc('day', now())
    		  AND timestamp < date_trunc('day', now()) + INTERVAL '1 day';
    	INSERT INTO things_log VALUES(now(), NEW.*);
    ELSIF (TG_OP = 'DELETE') THEN
    	DELETE FROM things_log
    		WHERE id = OLD.id
    		  AND timestamp >= date_trunc('day', now())
    		  AND timestamp < date_trunc('day', now()) + INTERVAL '1 day';
    	INSERT INTO things_log(timestamp, id, parent_id, author, ip, name, description, image_id) VALUES(now(), OLD.id, NULL, OLD.author, OLD.ip, NULL, NULL, NULL);
    END IF;
    RETURN NULL;
END;
$body$
LANGUAGE plpgsql;;


CREATE TRIGGER things_insert_logger
AFTER INSERT OR DELETE ON things FOR EACH ROW
EXECUTE PROCEDURE things_logger();;

CREATE TRIGGER things_update_logger
AFTER UPDATE ON things FOR EACH ROW
-- WHEN ( (OLD.col1, OLD.col2, OLD.col3) IS DISTINCT FROM (NEW.col1, NEW.col2, NEW.col3) )
EXECUTE PROCEDURE things_logger();;










------
-- Autopopulate referenced things
------
DROP FUNCTION IF EXISTS things_autopopulate() CASCADE;;
CREATE FUNCTION things_autopopulate() RETURNS trigger AS $things_autopopulate$
	BEGIN
		IF NEW.parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM things WHERE id = NEW.parent_id) THEN
			INSERT INTO things(id) VALUES(NEW.parent_id);
		END IF;
		RETURN NEW;
	END;
$things_autopopulate$ LANGUAGE plpgsql;;
CREATE TRIGGER things_autopopulate_trigger BEFORE INSERT OR UPDATE ON things
	FOR EACH ROW EXECUTE PROCEDURE things_autopopulate();;


------
-- Garbage collection: remove empty ids that have no descendant
------
DROP FUNCTION IF EXISTS things_gc() CASCADE;;
CREATE FUNCTION things_gc() RETURNS trigger AS $things_gc$
	BEGIN
		IF
			NEW.parent_id IS NULL AND
			COALESCE(NEW.name, '')='' AND
			COALESCE(NEW.description, '')='' AND
			COALESCE(NEW.image_id, '')=''
		THEN
			BEGIN
				DELETE FROM things WHERE id = NEW.id;
			EXCEPTION
				WHEN integrity_constraint_violation
				  OR restrict_violation
				  OR not_null_violation
				  OR foreign_key_violation
				  OR unique_violation
				  OR check_violation
				  OR integrity_constraint_violation THEN
			END;
		END IF;

		IF TG_OP='UPDATE' AND OLD.parent_id IS NOT NULL THEN
			BEGIN
				DELETE FROM things
				WHERE
					id = OLD.parent_id AND
					parent_id IS NULL AND
					COALESCE(name, '')='' AND
					COALESCE(description, '')='' AND
					COALESCE(image_id, '')='';
			EXCEPTION
				WHEN integrity_constraint_violation
				  OR restrict_violation
				  OR not_null_violation
				  OR foreign_key_violation
				  OR unique_violation
				  OR check_violation
				  OR integrity_constraint_violation THEN
			END;
		END IF;

		RETURN NEW;
	END;
$things_gc$ LANGUAGE plpgsql;;
CREATE CONSTRAINT TRIGGER things_gc_trigger AFTER INSERT OR UPDATE ON things
	DEFERRABLE INITIALLY DEFERRED
	FOR EACH ROW EXECUTE PROCEDURE things_gc();;


INSERT INTO printed_eans(id) VALUES(978210055994);;
INSERT INTO things(id, parent_id, name, description) VALUES
	(40000900001, DEFAULT, 'Electrolab', 'Une sorte de fablab.'),
	(40000900002, 40000900001, 'Zone accueil', DEFAULT),
	(40000900003, 40000900001, 'Zone convi (lounge)', DEFAULT),
	(40000900004, 40000900001, 'Zone projets', DEFAULT),
	(40000900005, 40000900001, 'Zone élec', DEFAULT),
	(40000900006, 40000900001, 'Zone méca light', DEFAULT),
	(40000900007, 40000900001, 'Zone méca lourde', DEFAULT),
	(40000900008, 40000900001, 'Zone impression 2D', DEFAULT),
	(40000900009, 40000900001, 'Zone chimie', DEFAULT),
	(40000900010, 40000900001, 'Zone cathédrale', DEFAULT),
	(40000900011, 40000900001, 'Zone élec plus', '(Ancienne zone convi)'),
	(40000900012, 40000900001, 'Zone stockage huile', DEFAULT),
	(40000900013, 40000900001, 'Zone traitement de surface', DEFAULT),
	(40000900014, 40000900001, 'Zone fonderie', DEFAULT),
	(40000900015, 40000900001, 'Zone formation 1', DEFAULT),
	(40000900016, 40000900001, 'Zone formation 2', DEFAULT),
	(40000900017, 40000900001, 'Zone stock travaux', DEFAULT),

	(40000300017, 40000900005, 'Carton à scanners', 'Carton contenant les scanners à code barre'),
	(40000300127, 40000900006, 'Malette outillage', 'Un genre de grosse valise'),

	(40000300074, 40000900004, 'Imprimante grandes étiquettes', DEFAULT),
	(40000300126, 40000900004, 'Imprimante petites étiquettes', DEFAULT)

;;

-- http://blog.lostpropertyhq.com/postgres-full-text-search-is-good-enough/

-- CREATE EXTENSION IF NOT EXISTS unaccent;;

DROP TEXT SEARCH CONFIGURATION IF EXISTS fr;;
CREATE TEXT SEARCH CONFIGURATION fr ( COPY = french );;

ALTER TEXT SEARCH CONFIGURATION fr ALTER MAPPING
FOR hword, hword_part, word WITH unaccent, french_stem;;

DROP VIEW IF EXISTS search_things;;
CREATE VIEW search_things AS
SELECT
	things.*,
	(
		setweight(to_tsvector('fr', coalesce(things.name,'')), 'A') ||
		setweight(to_tsvector('fr', coalesce(things.description,'')), 'B')
	) as document
FROM things;;

-- CREATE INDEX idx_search_things ON search_things USING gin(document);;

COMMIT;;
