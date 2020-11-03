#!/bin/bash
docker build -f frontend-docker -t name-tbd:frontend .
docker build -f backend-docker -t name-tbd:backend .
