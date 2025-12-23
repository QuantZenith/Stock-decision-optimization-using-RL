# realtime/config_smartapi.py
"""
Configuration for SmartAPI streaming client.
FILL THESE WITH YOUR REAL VALUES (DO NOT COMMIT TO GIT).
"""

# ---- SmartAPI credentials ----
SMARTAPI_API_KEY = "uaucQMOd"
SMARTAPI_CLIENT_ID = "S1858330"   # Angel One client code
SMARTAPI_PASSWORD = "1219"   # trading password / PIN
SMARTAPI_TOTP_SECRET = "RBDFRA4P2XCOFW6R7SMD54XOQQ"    # from SmartAPI TOTP setup

# ---- Backend config ----
BACKEND_SIGNAL_URL = "http://127.0.0.1:4000/api/signal"

# ---- RL env / obs config ----
WINDOW_SIZE = 20  # must match your env.window_size (obs_len = window_size + 1)

# ---- Symbols to track ----
# You MUST fill the correct symbol tokens as per Angel's symbol master
# Example below is just illustrative; replace with real tokens from Angel.
SYMBOL_TOKEN_MAP = {
    # "symbol": (exchangeType, token)
    "NIFTY": (1, "26000")      # example token, replace
      # example token, replace
    # add more symbols here...
}
