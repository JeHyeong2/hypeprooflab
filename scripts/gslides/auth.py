#!/usr/bin/env python3
"""Google OAuth helper for Slides + Drive scopes."""

import os
import pickle

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive',
]
CREDS_JSON = os.path.expanduser('~/.cm-tracker/config/gmail-credentials.json')
TOKEN_PATH = os.path.expanduser('~/.cm-tracker/config/slides-token.pickle')


def get_credentials(creds_json=None, token_path=None):
    """Get valid OAuth credentials, refreshing or re-authenticating as needed.

    Args:
        creds_json: Path to OAuth client secrets JSON. Defaults to ~/.cm-tracker/config/gmail-credentials.json
        token_path: Path to cached token pickle. Defaults to ~/.cm-tracker/config/slides-token.pickle
    """
    creds_json = creds_json or CREDS_JSON
    token_path = token_path or TOKEN_PATH

    creds = None
    if os.path.exists(token_path):
        with open(token_path, 'rb') as f:
            creds = pickle.load(f)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(creds_json, SCOPES)
            creds = flow.run_local_server(port=8099, open_browser=True)
        with open(token_path, 'wb') as f:
            pickle.dump(creds, f)

    return creds


if __name__ == '__main__':
    creds = get_credentials()
    print(f'Token saved: {TOKEN_PATH}')
    print(f'Scopes: {creds.scopes}')
