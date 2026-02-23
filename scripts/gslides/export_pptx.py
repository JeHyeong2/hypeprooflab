#!/usr/bin/env python3
"""Export Google Slides presentation as .pptx via Drive API."""

import argparse
import io
import os

from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

from .auth import get_credentials

PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'


def export(presentation_id, output_path, creds=None):
    """Download Google Slides as .pptx.

    Args:
        presentation_id: Google Slides presentation ID
        output_path: Local file path for the .pptx
        creds: Optional Google OAuth credentials
    """
    if creds is None:
        creds = get_credentials()

    drive = build('drive', 'v3', credentials=creds)
    request = drive.files().export_media(
        fileId=presentation_id,
        mimeType=PPTX_MIME,
    )

    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()
        if status:
            print(f'  Download: {int(status.progress() * 100)}%')

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(fh.getvalue())

    size_kb = os.path.getsize(output_path) / 1024
    print(f'Exported: {output_path} ({size_kb:.0f} KB)')


def main():
    parser = argparse.ArgumentParser(description='Export Google Slides to PPTX')
    parser.add_argument('--id', required=True, help='Google Slides presentation ID')
    parser.add_argument('--output', '-o', required=True, help='Output .pptx path')
    args = parser.parse_args()
    export(args.id, args.output)


if __name__ == '__main__':
    main()
