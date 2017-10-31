#!/bin/bash
# simple launch script
# This script runs the following commands in order:
#
# truffle compile
# truffle migrate
# npm run dev
#

if [ -d "~/tmp" ]; then
	TEMP_DIR = ~/tmp
else
	TEMP_DIR = /tmp
fi

TEMP_FILE = $TEMP_DIR/printfile.$$.$RANDOM 

cleanup() {
	exit $1
}

error_exit() {
	echo "${PROGNAME}: ${1:-"Error"}" 1>&2
	cleanup 1
}

trap cleanup SIGHUP SIGINT SIGTERM

echo 'Running truffle compile...'
truffle compile || error_exit "truffle compile failed. exiting...\n"
echo

'Running truffle migrate...'
truffle migrate || error_exit "truffle migrate failed. exiting...\n"
echo

echo 'Starting server with npm run dev...'
npm run dev || error_exit "server failed to start. exiting...\n"
echo

cleanup
