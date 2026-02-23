#!/usr/bin/env python3
"""Google OAuth helper — Slides + Drive scopes."""
import os, pickle
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive',
]
CREDS_JSON = os.path.expanduser('~/.cm-tracker/config/gmail-credentials.json')
TOKEN_PATH = os.path.expanduser('~/.cm-tracker/config/slides-token.pickle')


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, 'rb') as f:
            creds = pickle.load(f)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDS_JSON, SCOPES)
            creds = flow.run_local_server(port=8099, open_browser=True)
        with open(TOKEN_PATH, 'wb') as f:
            pickle.dump(creds, f)
    return creds


if __name__ == '__main__':
    creds = get_credentials()
    print(f'✅ Token saved: {TOKEN_PATH}')
    print(f'   Scopes: {creds.scopes}')
