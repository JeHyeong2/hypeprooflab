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


def update(presentation_id, slide_indices, slides, builders, creds=None):
    """Update specific slides in an existing presentation.

    Deletes all elements on target slides and re-runs their builders.
    Leaves untouched slides intact, saving ~70% token cost on partial fixes.

    Args:
        presentation_id: Existing Google Slides presentation ID.
        slide_indices: List of 0-based slide indices to rebuild.
        slides: Full list of slide dicts (same as generate()).
        builders: Dict mapping build IDs to builder functions.
        creds: Optional Google OAuth credentials.

    Returns:
        Tuple of (presentation_url, presentation_id)
    """
    reset_counter()

    if creds is None:
        creds = get_credentials()

    svc = build('slides', 'v1', credentials=creds)

    # Get current presentation to find page object IDs
    pres = svc.presentations().get(presentationId=presentation_id).execute()
    page_ids = [s['objectId'] for s in pres.get('slides', [])]

    if not page_ids:
        raise ValueError('Presentation has no slides')

    # Validate indices
    valid_indices = [i for i in slide_indices if 0 <= i < len(page_ids)]
    if not valid_indices:
        raise ValueError(f'No valid slide indices in {slide_indices} (presentation has {len(page_ids)} slides)')

    print(f'Updating {len(valid_indices)} of {len(page_ids)} slides in {presentation_id}')

    # Step 1: Delete all elements on target slides
    delete_reqs = []
    for idx in valid_indices:
        page_id = page_ids[idx]
        # Get all element IDs on this page
        page_data = pres['slides'][idx]
        for elem in page_data.get('pageElements', []):
            delete_reqs.append({'deleteObject': {'objectId': elem['objectId']}})

    if delete_reqs:
        # Batch delete in chunks
        for start in range(0, len(delete_reqs), 400):
            svc.presentations().batchUpdate(
                presentationId=presentation_id,
                body={'requests': delete_reqs[start:start + 400]},
            ).execute()
        print(f'  Deleted {len(delete_reqs)} elements from {len(valid_indices)} slides')

    # Step 2: Re-run builders for target slides
    reqs = []
    for idx in valid_indices:
        if idx >= len(slides):
            print(f'  Slide {idx + 1}: no data in slides list, skipping')
            continue
        s = slides[idx]
        b = builders.get(s['build'])
        if b:
            reqs.extend(b(page_ids[idx], s))
            print(f'  Slide {idx + 1}: rebuilt {s["build"]}')

    if reqs:
        for start in range(0, len(reqs), 400):
            svc.presentations().batchUpdate(
                presentationId=presentation_id,
                body={'requests': reqs[start:start + 400]},
            ).execute()

    url = f'https://docs.google.com/presentation/d/{presentation_id}/edit'
    print(f'{len(reqs)} requests (update) -> {url}')
    return url, presentation_id
