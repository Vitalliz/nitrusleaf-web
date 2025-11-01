#!/usr/bin/env bash
# wait-for-it.sh: aguarda um host:porta estar disponível
set -e

host="$1"
port="$2"
shift 2

until nc -z "$host" "$port"; do
  echo "Aguardando $host:$port..."
  sleep 2
done

exec "$@"
