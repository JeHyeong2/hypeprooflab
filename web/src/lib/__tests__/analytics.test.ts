import { describe, it, expect } from 'vitest';
import { detectAIReferrer, parseUTMParams, AI_REFERRERS } from '../analytics';

describe('detectAIReferrer', () => {
  it('detects ChatGPT referrer', () => {
    expect(detectAIReferrer('https://chat.openai.com/')).toBe('chatgpt');
    expect(detectAIReferrer('https://chatgpt.com/c/abc')).toBe('chatgpt');
  });

  it('detects Perplexity referrer', () => {
    expect(detectAIReferrer('https://www.perplexity.ai/search/abc')).toBe('perplexity');
  });

  it('detects Claude referrer', () => {
    expect(detectAIReferrer('https://claude.ai/chat/123')).toBe('claude');
  });

  it('detects Gemini referrer', () => {
    expect(detectAIReferrer('https://gemini.google.com/app')).toBe('gemini');
  });

  it('detects Copilot referrer', () => {
    expect(detectAIReferrer('https://copilot.microsoft.com/')).toBe('copilot');
  });

  it('detects You.com referrer', () => {
    expect(detectAIReferrer('https://you.com/search?q=test')).toBe('you');
  });

  it('detects Phind referrer', () => {
    expect(detectAIReferrer('https://phind.com/search')).toBe('phind');
  });

  it('returns null for non-AI referrers', () => {
    expect(detectAIReferrer('https://google.com/search?q=test')).toBeNull();
    expect(detectAIReferrer('https://twitter.com/post/123')).toBeNull();
    expect(detectAIReferrer('')).toBeNull();
  });

  it('handles invalid URLs gracefully', () => {
    expect(detectAIReferrer('not-a-url')).toBeNull();
  });

  it('covers all defined AI referrers', () => {
    for (const [domain, source] of Object.entries(AI_REFERRERS)) {
      expect(detectAIReferrer(`https://${domain}/path`)).toBe(source);
    }
  });
});

describe('parseUTMParams', () => {
  it('extracts UTM parameters from URL', () => {
    const result = parseUTMParams('https://example.com?utm_source=twitter&utm_medium=social&utm_campaign=launch');
    expect(result).toEqual({
      utm_source: 'twitter',
      utm_medium: 'social',
      utm_campaign: 'launch',
    });
  });

  it('ignores non-UTM parameters', () => {
    const result = parseUTMParams('https://example.com?foo=bar&utm_source=test');
    expect(result).toEqual({ utm_source: 'test' });
  });

  it('returns empty object for no UTM params', () => {
    const result = parseUTMParams('https://example.com?foo=bar');
    expect(result).toEqual({});
  });

  it('handles malformed URLs', () => {
    const result = parseUTMParams('not-a-url');
    expect(result).toEqual({});
  });
});
