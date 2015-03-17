#!/usr/bin/env python
# -*- coding: utf-8 -*-

from . import config
import pg8000
import re
import os
from DBUtils.PooledDB import PooledDB

pg8000.paramstyle = "named"
pool = PooledDB(
	mincached=1,
	maxcached=10,
	maxconnections=20,
	maxshared=0,
	blocking=True,
	creator=pg8000,
	host=config.DATABASE_HOST,
	user=config.DATABASE_USER,
	password=config.DATABASE_PASSWORD,
	database=config.DATABASE_NAME,
)

COLUMNS = {}
def init_columns():
	cur = pool.connection().cursor()
	tables = ["things", "blobs"]
	for table in tables:
		cur.execute("""SELECT * FROM "%s" LIMIT 0""" % table)
		COLUMNS[table] = [desc[0].lower() for desc in cur.description]

def reset():
	with open(os.path.join(os.path.dirname(__file__), "db.sql"), "r") as f:
		script = f.read().decode('utf8')
		script = re.sub(r'(?m)^\s*--.*?$', '', script)
	conn = pool.connection()
	for statement in script.split(";;"):
		statement = statement.strip()
		if statement and not statement.startswith("--"):
			cur = conn.cursor()
			cur.execute(statement)

def fetch(query, parameters):
	cur = pool.connection().cursor()
	cur.execute(query, parameters)
	while True:
		row = cur.fetchone()
		if row is None:
			break
		yield dict((("col_%i" % i) if desc[0]=="?column?" else desc[0].lower(), row[i]) for (i,desc) in enumerate(cur.description))

def get_one(table_name, id):
	objects = list(fetch("""
		SELECT *
		FROM "%s"
		WHERE id = :id
		""" % table_name, {"id": id}))
	if len(objects)==1:
		return objects[0]
	else:
		return None

def create_or_update(table_name, data):
	if not COLUMNS.has_key(table_name):
		raise Exception("Invalid table name: " + table_name)

	columns = []
	values = []
	insert_params = {"id": data["id"]}

	for (i,c) in enumerate(COLUMNS[table_name]):
		if data.has_key(c):
			columns.append(c)
			values.append(":val%d" % i)
			insert_params["val%d" % i] = data[c]

	columns = columns
	values  = values

	upsert_request = """
		WITH upsert AS (
			UPDATE "{table_name}"
			SET {sets}
			WHERE id = :id
			RETURNING *
		)
		INSERT INTO {table_name}({columns})
			SELECT {values}
			WHERE NOT EXISTS (SELECT * FROM upsert);
	""".format(
		table_name = table_name,
		sets = ", ".join(map(lambda (col, val): col+"="+val, zip(columns, values))),
		columns = ", ".join(columns),
		values = ", ".join(values),
	)

	conn = pool.connection()
	cur = conn.cursor()
	cur.execute("BEGIN")
	cur.execute("LOCK TABLE %s IN SHARE ROW EXCLUSIVE MODE;" % table_name)
	cur.execute(upsert_request, insert_params)
	cur.execute("COMMIT;")

def get_thing(ean):
	return get_one("things", ean)


def get_thing_ancestors(ean):
	things = list(fetch("""
		WITH RECURSIVE things_uptoroot AS (
			SELECT parent.*
			FROM things AS child
			INNER JOIN things AS parent ON (child.parent_id = parent.id)
			WHERE child.id = :ean
			UNION ALL
				SELECT parent.*
				FROM things_uptoroot AS child
				INNER JOIN things AS parent ON (child.parent_id = parent.id)
		)
		SELECT *
		FROM things_uptoroot
		LIMIT 10000
		""", {"ean": ean}))

	things.reverse()
	return things

def get_thing_children(ean):
	things = list(fetch("""
		SELECT child.*
		FROM things AS parent
		INNER JOIN things AS child ON (child.parent_id = parent.id)
		WHERE parent.id = :ean
		""", {"ean": ean}))

	things.reverse()
	return things


def put_thing(thing):
	create_or_update("things", thing)

def put_blob(blob):
	blob["content"] = pg8000.Bytea(blob["content"])
	create_or_update("blobs", blob)

def get_blob(sha256):
	return get_one("blobs", sha256)

def search(text):
	query_terms = re.compile(r"\W+", flags=re.UNICODE).split(text)
	query = " & ".join(t for t in query_terms if t)

	results = list(fetch("""
		SELECT *, ts_rank(document, to_tsquery('fr', :query)) as rank
		FROM search_things
		WHERE document @@ to_tsquery('fr', :query)
		ORDER BY ts_rank(document, to_tsquery('fr', :query)) DESC
		LIMIT 50
	""", {"query": query}))

	for r in results:
		del r['document']

	return results

reset()
init_columns()
