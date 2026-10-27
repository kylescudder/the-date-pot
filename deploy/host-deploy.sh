#!/usr/bin/env bash
# Manual deployment through the single installed service and the existing app lock.
set -euo pipefail
exec python3 -B /Users/kyle/platform/deploy-core/current/deploy_service.py \
  --config /Users/kyle/platform/deploy-core/apps.json worker the-date-pot "$@"
