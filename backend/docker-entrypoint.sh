#!/bin/sh
set -eu

if [ -z "${SPRING_DATASOURCE_URL:-}" ]; then
  : "${DATABASE_URL:?Set DATABASE_URL or SPRING_DATASOURCE_URL}"
  case "$DATABASE_URL" in
    postgres://*|postgresql://*)
      database_address="${DATABASE_URL#*://}"
      database_address="${database_address#*@}"
      export SPRING_DATASOURCE_URL="jdbc:postgresql://${database_address}"
      ;;
    *)
      echo "DATABASE_URL must use the postgres:// or postgresql:// scheme" >&2
      exit 1
      ;;
  esac
fi

exec java -jar /app/neurolearn.jar
