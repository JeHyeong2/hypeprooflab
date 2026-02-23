"""Google Slides API client — create and update presentations."""

from googleapiclient.discovery import build

from .auth import get_credentials
from .primitives import reset_counter


def generate(title, slides, builders, creds=None):
    """Create a Google Slides presentation.

    Args:
        title: Presentation title string
        slides: List of slide dicts. Each must have a 'build' key mapping to a builder.
        builders: Dict mapping build IDs to builder functions.
                  Each builder takes (page_id, slide_dict) and returns a list of API requests.
        creds: Optional Google OAuth credentials. Auto-authenticates if None.

    Returns:
        Tuple of (presentation_url, presentation_id)
    """
    reset_counter()

    if creds is None:
        creds = get_credentials()

    svc = build('slides', 'v1', credentials=creds)
    pres = svc.presentations().create(body={'title': title}).execute()
    pid = pres['presentationId']
    print(f'Created: https://docs.google.com/presentation/d/{pid}')

    default = pres['slides'][0]['objectId']
    setup = []
    pages = []
    for i in range(len(slides)):
        p = f'page_{i:02d}'
        pages.append(p)
        setup.append({'createSlide': {'objectId': p, 'insertionIndex': i}})
    setup.append({'deleteObject': {'objectId': default}})
    svc.presentations().batchUpdate(presentationId=pid, body={'requests': setup}).execute()

    reqs = []
    for i, s in enumerate(slides):
        b = builders.get(s['build'])
        if b:
            reqs.extend(b(pages[i], s))
            print(f'  Slide {i + 1}: {s["build"]}')

    # Batch in chunks of 400 to avoid API limits
    for start in range(0, len(reqs), 400):
        svc.presentations().batchUpdate(
            presentationId=pid,
            body={'requests': reqs[start:start + 400]},
        ).execute()

    url = f'https://docs.google.com/presentation/d/{pid}/edit'
    print(f'{len(reqs)} requests -> {url}')
    return url, pid
