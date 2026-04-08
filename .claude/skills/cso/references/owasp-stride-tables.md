# OWASP Top 10 + STRIDE Reference Tables

## OWASP Top 10

| # | Category | What to Check |
|---|----------|---------------|
| A01 | Broken Access Control | Missing auth, IDOR, path traversal, CORS |
| A02 | Cryptographic Failures | Hardcoded secrets, weak hashing, plaintext, missing TLS |
| A03 | Injection | SQL/command/XSS/template/LDAP injection |
| A04 | Insecure Design | Missing rate limiting, no input validation at trust boundaries |
| A05 | Security Misconfiguration | Default creds, verbose errors, unnecessary features |
| A06 | Vulnerable Components | Known-vulnerable deps, outdated packages |
| A07 | Auth Failures | Weak passwords, missing MFA, session fixation |
| A08 | Data Integrity Failures | Insecure deserialization, missing integrity checks |
| A09 | Logging Failures | Missing security logging, sensitive data in logs |
| A10 | SSRF | Unvalidated URLs in server-side requests |

## STRIDE

| Threat | Question |
|--------|----------|
| **S**poofing | Can an attacker impersonate a user or component? |
| **T**ampering | Can data be modified in transit or at rest? |
| **R**epudiation | Can actions be denied without proof? |
| **I**nformation Disclosure | Can sensitive data leak? |
| **D**enial of Service | Can the system be made unavailable? |
| **E**levation of Privilege | Can a low-privilege user gain higher access? |

## False-Positive Exclusions (17 patterns)

1. Test files (`*_test.*`, `test_*`, `tests/`)
2. Example/template files (`.env.example`, `*.sample`)
3. Doc strings with example values
4. Lock files
5. Generated code (`dist/`, `build/`)
6. Vendor dirs (`node_modules/`, `vendor/`)
7. Short Base64 strings (<20 chars)
8. Hash constants for comparison
9. Dev-only debug flags behind env guards
10. Type stubs / interfaces
11. Mock/fixture data
12. Git-ignored paths
13. CSS/SVG data URIs
14. Package registry URLs
15. Public keys (only flag private)
16. Archived files
17. Auto-generated config comments
