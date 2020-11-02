#!/bin/bash
set -e
export SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $SCRIPT_DIR
export CODE_DIR=`dirname $SCRIPT_DIR`
export HOME_DIR=$HOME
export MONGODB_USERNAME="nametbd"
export MONGODB_HOST="passtbd"
export MONGODB_DB="SDC"
compose_cmd="docker-compose -p $USER -f docker-compose.yaml"
$compose_cmd up -d

echo "Ready"
