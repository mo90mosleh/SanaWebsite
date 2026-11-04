# Sana / Ortanes catalogue — 2026-11-04

The supplied kit-order workbook is the allowlist for the POCT catalogue: exactly 36 assays. Original worksheet row numbers are retained. Display aliases normalize A1C to HbA1c, PRO BNP to NT-proBNP, FOB to FOB/iFOB, and CANCER125/19/15 to CA125/CA19-9/CA15-3. These aliases do not establish new manufacturer SKUs or device compatibility. Testosterone and estradiol have no invented code or compatibility claim.

The supplied Ortanes price PDF dated 1405/08/04 contains 75 laboratory consumable variants on page 1 and 96 entries on page 2. Variant sizes, cap colours and source page/row are retained. Row 76 is a BHA-3000 device (already in the device catalogue), row 77 is BABIO procalcitonin (outside the approved POCT workbook), and row 78 is unnamed; they are intentionally not added as Ortanes consumables. Existing Wondfo assays outside the workbook are archived rather than destroying old order references.

Prices and stock are explicitly demo values. The PDF does not explicitly state the currency or consistently distinguish unit/pack/carton prices. Therefore neither its consumer nor collaborator amounts have been silently converted to toman or multiplied by carton counts. Carton counts are informational packaging fields, not a new inferred selling unit. Undefined tests-per-kit remain unconfirmed.

## Identity and artwork
Original Ortanes logo: https://ortanes.com/wp-content/uploads/2020/12/untitled-3-1.png, found in the current home page at https://www.ortanes.com on 2026-11-04. Logo proportions/identity preserved; optimized as WebP. Logo and category assets are embedded data URLs so no third-party image requests are required at runtime.

Nine category illustrations generated with the built-in ImageGen tool: POCT kits, specimen containers, laboratory tubes, pipette tips, biochemistry cups, culture media/petri dishes, microscope slides, cytology/pathology and cold-chain supplies. Shared prompt: a centered premium soft 3D laboratory product illustration, pale mint/white studio background, translucent plastic/glass, teal/blue/red accents, generous circular-crop margin, no text/logos/hands/watermarks. Each category uses its corresponding objects. Optimized to 320px WebP in src/generatedCategoryImages.ts. The images are illustrative, not photographs of actual packaging.

Product cards keep the existing editable SVG kit-box illustration for POCT. Ortanes consumables use category-specific SVG artwork (jars, tubes, tips, sample cups, culture plates/broth tubes, slides, pathology cassettes and ice packs), with product titles outside the image. Source artwork: src/KitArtwork.tsx and src/LaboratoryArtwork.tsx.

## Behaviour
Public navigation and homepage now include laboratory consumables and Ortanes. Public and customer catalogues have a horizontally scrollable, keyboard-accessible circular category strip and all/POCT/Ortanes family selection. POCT also has clinical test-group filtering. Customer cart supports mixed product families. Ortanes consumables require an active customer but no purchased device; POCT still requires verified model compatibility. Stock/payment/reorder checks share the same domain function.

The one-time catalog migration preserves existing product prices/stock, customers, addresses, tickets and order snapshots; excluded old items remain archived and cannot be reordered. Admin lists hide archived items. Admin product editing/import supports Ortanes and family/category metadata.

## Validation
36 Node tests passed, including new allowlist, PDF row coverage, no-device Ortanes purchase, stock/payment and idempotent data migration tests. TypeScript and Pages production build passed. Browser test cases are included in tests/catalog-ui.spec.ts. Local Playwright browser download was unavailable in this environment (truncated download); browser checks require a usable Chromium installation or live preview review.
