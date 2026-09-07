# Duplicate Documentation Resolution

> **Generated**: January 8, 2026  
> **Resolved**: September 7, 2026  
> **Status**: Complete  
> **Purpose**: Record how duplicate tool docs were consolidated

## What was resolved

Two kinds of duplicates existed after the `docs/` reorg:

1. **Numbered vs numbered** (the original 14-pair inventory). The extra numbered copies (`87_`, `88_`, `89_`, `90_`, `91_`, `92_`, `94_`, `95_`, `96_`, `03_`, `10_`, `32_`, `61_`, `82_`) were already gone after the folder move; only one numbered file remains per tool.
2. **Numbered technical docs vs unnumbered user guides** (12 pairs). Complementary content: numbered files are implementation notes; unnumbered files are how-to guides. These were merged on September 7, 2026.

## Merged pairs (keep numbered, append user guide, delete unnumbered)

| Canonical file | User guide absorbed |
| --- | --- |
| `docs/tools/data/70_CSV_EXCEL_CONVERTER.md` | `CSV_EXCEL_CONVERTER.md` |
| `docs/tools/data/14_JSON_TO_CSV.md` | `JSON_TO_CSV.md` |
| `docs/tools/data/72_UUID_GENERATOR.md` | `UUID_GENERATOR.md` |
| `docs/tools/design/29_COLOR_CONTRAST_CHECKER.md` | `COLOR_CONTRAST_CHECKER.md` |
| `docs/tools/development/56_AI_CODE_CONVERTER.md` | `AI_CODE_CONVERTER.md` |
| `docs/tools/development/52_REGEX_TESTER.md` | `REGEX_TESTER.md` |
| `docs/tools/media/100_IMAGE_TO_TEXT_OCR.md` | `IMAGE_TO_TEXT_OCR.md` |
| `docs/tools/productivity/97_AI_TEXT_REWRITER.md` | `AI_TEXT_REWRITER.md` |
| `docs/tools/productivity/98_GRAMMAR_CHECKER.md` | `GRAMMAR_CHECKER.md` |
| `docs/tools/productivity/93_QR_CODE_GENERATOR.md` | `QR_CODE_GENERATOR.md` |
| `docs/tools/productivity/99_TEXT_SUMMARIZER.md` | `TEXT_SUMMARIZER.md` |
| `docs/tools/security/13_HASH_GENERATOR.md` | `HASH_GENERATOR.md` |

Merge method: append the user guide after the technical content, demote its headings by one level, and label that section `## User Guide`. Live index links in `docs/tools/README.md` now point only at the numbered files.

## Left as companions (not duplicates)

These unnumbered files are extra examples or Pro notes, not a second full guide:

- `docs/tools/data/JSON_BEAUTIFIER_PRO_EXAMPLES.md`
- `docs/tools/productivity/RESUME_BUILDER_DOCUMENTATION.md`
- `docs/tools/security/PASSWORD_GENERATOR_PRO_EXAMPLES.md`

## Historical inventory (original 14 numbered pairs)

The January 8 plan listed numbered-vs-numbered pairs. After the folder reorg those extra numbered files no longer exist; the surviving canonical files are:

| Tool | Canonical file |
| --- | --- |
| QR Code Generator | `docs/tools/productivity/93_QR_CODE_GENERATOR.md` |
| Password Generator | `docs/tools/security/04_PASSWORD_GENERATOR.md` |
| Markdown Editor | `docs/tools/productivity/06_MARKDOWN_EDITOR.md` |
| Video Converter | `docs/tools/media/61_VIDEO_CONVERTER_COMPRESSOR.md` |
| Hash Generator | `docs/tools/security/13_HASH_GENERATOR.md` |
| JSON to CSV | `docs/tools/data/14_JSON_TO_CSV.md` |
| Unit Converter | `docs/tools/productivity/15_UNIT_CONVERTER.md` |
| API Tester | `docs/tools/development/77_API_TESTER.md` |
| Color Contrast | `docs/tools/design/29_COLOR_CONTRAST_CHECKER.md` |
| Date Formatter | `docs/tools/data/81_DATE_FORMATTER.md` |
| Regex Tester | `docs/tools/development/52_REGEX_TESTER.md` |
| CSV/Excel | `docs/tools/data/70_CSV_EXCEL_CONVERTER.md` |
| UUID Generator | `docs/tools/data/72_UUID_GENERATOR.md` |
| Loan Calculator | `docs/tools/finance/86_LOAN_CALCULATOR.md` |

## Related documents

- [Documentation Gaps Analysis](./DOCUMENTATION_GAPS_ANALYSIS.md)
- [Tool Documentation Master](../tools/README.md)
