# File Mode

When the user provides a file path, pastes text, or describes content to ingest.

## Input Validation

Accepted input formats:
- **File path**: `/ingest path/to/file.md` or `/ingest path/to/file.pdf`
- **Pasted text**: `/ingest` followed by pasted content in the same message
- **Conversational**: `/ingest meeting notes from today's AutoEver call` — then the user provides content

Validation rules:
- Input must be non-empty. If empty, print: "No input provided. Please paste a document, provide a file path, or describe the content to ingest."
- For file paths, verify the file exists before proceeding
- For PDFs, use the Read tool with page ranges

## SPEAKER_N Resolution

When ingesting a file that contains SPEAKER_N patterns (e.g., manually provided Gemini Notes):

1. **Detect**: Scan input for `SPEAKER_\d` patterns
2. **If found**: Use `AskUserQuestion` with sample quotes from each speaker
3. **Replace before Phase 1**: All agents receive the corrected text with real names

This ensures stakeholder-mapper and signal-extractor correctly attribute findings to named individuals.

## Execution

Run the standard Phase 1-4 pipeline on the input, then print the Ingestion Summary Report.
