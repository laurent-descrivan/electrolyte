#!/usr/bin/env python
# -*- coding: utf-8 -*-

import conf.db_app, conf.db_reset
import pg8000
import re
import os
from DBUtils.PooledDB import PooledDB

pg8000.paramstyle = "named"

def reset():
	"""
		Reset the new app database connection
		/!\\ Very destructive !
	"""
	# reset_pool = PooledDB(
	# 	mincached=1,
	# 	maxcached=10,
	# 	maxconnections=20,
	# 	maxshared=0,
	# 	blocking=True,
	# 	creator=pg8000,
	# 	host=conf.db_app.DATABASE_HOST,
	# 	user=conf.db_reset.DATABASE_SUPER_USER,
	# 	password=conf.db_reset.DATABASE_SUPER_PASSWORD,
	# )
	conn = pg8000.connect(
		host=conf.db_app.DATABASE_HOST,
		user=conf.db_reset.DATABASE_SUPER_USER,
		password=conf.db_reset.DATABASE_SUPER_PASSWORD,
	)
	conn.autocommit = True
	cur = conn.cursor()
	cur.execute(""" DROP DATABASE IF EXISTS "%s" """ % conf.db_app.DATABASE_NAME)

	if conf.db_app.DATABASE_USER != conf.db_reset.DATABASE_SUPER_USER:
		cur.execute(""" DROP USER IF EXISTS %s """ % conf.db_app.DATABASE_USER)
		cur.execute(""" CREATE USER %s WITH PASSWORD '%s' """ % (conf.db_app.DATABASE_USER, conf.db_app.DATABASE_PASSWORD));

	cur.execute("""
		CREATE DATABASE "%s" WITH
			OWNER %s
			TEMPLATE = template0
			ENCODING = 'UTF8'
			LC_COLLATE = 'fr_FR.UTF-8'
			LC_CTYPE = 'fr_FR.UTF-8'
	""" % (conf.db_app.DATABASE_NAME, conf.db_app.DATABASE_USER));

	# Reconnect as super user using newly created database
	conn = pg8000.connect(
		host=conf.db_app.DATABASE_HOST,
		user=conf.db_reset.DATABASE_SUPER_USER,
		password=conf.db_reset.DATABASE_SUPER_PASSWORD,
		database=conf.db_app.DATABASE_NAME,
	)
	conn.autocommit = True
	cur = conn.cursor()
	cur.execute(""" CREATE EXTENSION IF NOT EXISTS unaccent """)

	migrate()


pool = None
def connection():
	"""
		Get a new app database connection
	"""
	global pool
	if pool is None:
		pool = PooledDB(
			mincached=1,
			maxcached=10,
			maxconnections=20,
			maxshared=0,
			blocking=True,
			creator=pg8000,
			host=conf.db_app.DATABASE_HOST,
			user=conf.db_app.DATABASE_USER,
			password=conf.db_app.DATABASE_PASSWORD,
			database=conf.db_app.DATABASE_NAME,
		)
	return pool.connection()

def execute_file(filename):
	"""
		Execute a sql file in the database
	"""
	with open(os.path.join(os.path.dirname(__file__), filename), "r") as f:
		script = f.read().decode('utf8')
		script = re.sub(r'(?m)^\s*--.*?$', '', script)
	conn = connection()
	for statement in script.split(";;"):
		statement = statement.strip()
		if statement and not statement.startswith("--"):
			cur = conn.cursor()
			cur.execute(statement)

def migrate():
	keys = MIGRATIONS.keys()
	keys.sort()
	conn = connection()
	conn.cursor().execute("""
		CREATE TABLE IF NOT EXISTS migrations (
			"id" varchar(255) NOT NULL,
			CONSTRAINT "migrations_pkey_id" PRIMARY KEY ("id") NOT DEFERRABLE INITIALLY IMMEDIATE
		)
	""")
	conn.cursor().execute(""" COMMIT """)
	for k in keys:
		cur = conn.cursor()
		cur.execute("SELECT COUNT(*) FROM migrations WHERE id='%s'" % k)
		if cur.fetchone()[0]==0:
			MIGRATIONS[k]()
			cur = conn.cursor()
			print("INSERT INTO migrations(id) VALUES('%s')" % k)
			cur.execute("INSERT INTO migrations(id) VALUES('%s')" % k)
			conn.cursor().execute(""" COMMIT """)

MIGRATIONS = {
	"0000000001": lambda: execute_file("migration_1.sql")
}
