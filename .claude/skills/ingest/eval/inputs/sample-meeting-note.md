# HKMC CCU2 Workshop Follow-up Call — 2026-03-18

**Attendees**: Minhyuck Kim (HKMC), [[workspace/stakeholders/stakeholder-map.md|Yixiang Chen]] (HKMC), [[workspace/stakeholders/stakeholder-map.md|Jay Lee]] (Sonatus), [[workspace/stakeholders/stakeholder-map.md|Steve Stoddard]] (Sonatus)

## Discussion

- HKMC wants OTA-based diagnostic log upload integrated into [[workspace/agendas/uc-log-aggregation.md|CCU2]] by Q3 2026.
  They are concerned about bandwidth limits on the telematics channel.
- Minhyuck raised a pain point: current [[knowledge/products/ai-technician.md|AIT]] prototype does not support Korean language
  error codes in the diagnostic response. This blocks field technician adoption.
- Steve confirmed Sonatus can deliver a bilingual error code mapping by end of April.

## Decisions

- Agreed to use MQTT over cellular for diagnostic uploads (instead of CAN-FD relay).
- Workshop demo scheduled for April 15 in Seoul — Jay to coordinate logistics.

## Action Items

- [P0] Jay: Send workshop agenda draft to Minhyuck by 2026-03-22
- [P1] Steve: Prepare bilingual error code mapping spec by 2026-04-01
- [P2] Yixiang: Share HKMC telematics bandwidth test results with Sonatus team
