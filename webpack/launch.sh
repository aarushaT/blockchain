#!/bin/bash
# simple launch script
# This script runs the following commands in order:
#
# truffle compile
# truffle migrate
# npm run dev
#
#
echo 'Running truffle compile...'
truffle compile
echo

echo 'Running truffle migrate...'
truffle migrate
echo

echo 'Starting server with npm run dev...'
npm run dev
echo
