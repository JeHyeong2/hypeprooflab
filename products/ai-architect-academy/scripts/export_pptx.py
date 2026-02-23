#!/usr/bin/env python3
"""
Export Google Slides presentation as .pptx via Drive API.

Usage: python3 export_pptx.py --id <PRESENTATION_ID> [--output output/proposal.pptx]
"""
import argparse
import io
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from google_auth import get_credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'


def export_presentation(presentation_id: str, output_path: str):
    """Download Google Slides as .pptx."""
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
    print(f'✅ Exported: {output_path} ({size_kb:.0f} KB)')


def main():
    parser = argparse.ArgumentParser(description='Export Google Slides to PPTX')
    parser.add_argument('--id', required=True, help='Google Slides presentation ID')
    parser.add_argument('--output', '-o', default=os.path.join(
        os.path.dirname(__file__), '..', 'output', 'proposal.pptx'))
    args = parser.parse_args()

    export_presentation(args.id, args.output)


if __name__ == '__main__':
    main()
