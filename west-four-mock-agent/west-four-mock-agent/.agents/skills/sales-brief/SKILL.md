---
name: sales-brief
description: Prepare a fictional sales opportunity follow-up brief using customer, opportunity, and inventory records. Use when asked for a sales briefing or next-step recommendation.
---

# Sales follow-up brief

1. Find the opportunity by ID; if none is supplied, list opportunities and ask which one to use.
2. Retrieve the linked customer and relevant inventory. Prefer `prepare_brief` from `mock-sales-data` when connected; otherwise inspect the mock data files. Do not invent missing records.
3. Report project, stage, customer, requested quantities, available stock, shortages, and record dates.
4. State questions that must be answered before a quote or delivery commitment. Distinguish customer notes from verified operational facts.
5. Suggest one next action. Do not send messages, change records, or imply that prices are final.

Use headings: Opportunity, Stock check, Open questions, Suggested next step.
