#!/usr/bin/env python3
"""
Ping a health endpoint at a random interval between 600s and 840s.

Usage:
  python scripts/ping_health.py [URL]
  or set env var `HEALTH_URL`

Defaults to: https://peaklensphotographybackend.onrender.com/health
"""
import sys
import os
import time
import random
import urllib.request
import urllib.error
import datetime

DEFAULT_URL = "https://peaklensphotographybackend.onrender.com/health"
MIN_SEC = 600  # 10 minutes
MAX_SEC = 840  # 14 minutes
TIMEOUT = 30

def now():
    return datetime.datetime.utcnow().isoformat() + "Z"

def ping(url, timeout=TIMEOUT):
    req = urllib.request.Request(url, headers={"User-Agent": "ping-health-script/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return True, resp.getcode()
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return False, f"URL error: {e.reason}"
    except Exception as e:
        return False, str(e)

def main():
    url = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HEALTH_URL", DEFAULT_URL)
    print(now(), "Starting ping loop for", url)
    try:
        while True:
            ok, info = ping(url)
            if ok:
                print(now(), "PING OK", info)
            else:
                print(now(), "PING ERROR", info)
            interval = random.randint(MIN_SEC, MAX_SEC)
            print(now(), f"Next ping in {interval}s")
            time.sleep(interval)
    except KeyboardInterrupt:
        print(now(), "Exiting on user interrupt")

if __name__ == "__main__":
    main()
