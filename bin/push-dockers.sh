#!/bin/bash
# Make sure you are logged in fist
docker tag name-tbd:frontend tomac7/name-tbd:frontend
docker push tomac7/name-tbd:frontend
docker tag name-tbd:backend tomac7/name-tbd:backend
docker push tomac7/name-tbd:backend
