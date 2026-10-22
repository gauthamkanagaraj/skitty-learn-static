# Certificate template v3

`certificate-template-v3.svg` is the course completion certificate for SKE-10. It replaces `certificate-template-new.svg`. `certificate-fill-v3.js` is the reference code for filling and fitting it; the UI ports that code rather than loading it from here.

## Canvas and fonts

* `viewBox="0 0 1600 1131"`, with `data-template-version="3"` on the root. The award row stores this version, so an issued certificate always redraws with the template it was issued on.
* Fonts are embedded as base64 WOFF2, so nothing loads from outside the file:
  * `SKeta Sans` (Hanken Grotesk 400, 600, 800) for everything except the ID
  * `SKeta Mono` (JetBrains Mono 500, 700) for the certificate ID (`class="mono"`)
* Both fonts cover Latin script only. A name in another script falls back to a system font.

## Slots

| id | What goes in | Notes |
|---|---|---|
| `cert-name` | The name the learner confirmed | Fitted, one or two lines |
| `cert-course` | The course title stored on the award | Fitted, one or two lines |
| `cert-offer` | Fixed: "an online, non-credit course offered on SKeta" | Leave as is |
| `cert-partner-line` | "in collaboration with {partner name}" | Removed when the course has no partner |
| `cert-date` | Issue date, en-IN, for example `15 October 2026` | IST date |
| `cert-id` | Certificate ID, for example `7QMK-4XRT-9P` | Old IDs such as `cert-1-0107` also fit |
| `partner-group` / `partner-logo` | Partner logo, 300 × 120 at x 1130, y 122 | Empty `href` in the file. Removed when the course has no partner |

`partner-group` and `cert-partner-line` are always kept or removed together. A course with a partner name but no logo, or a logo but no name, is treated as SKeta-only.

The partner logo has to be set as a `data:` URI. A remote URL taints the canvas and the PNG download fails.

The footer reads "Check this certificate at sketa.tech/certificates". It is fixed text.

## Fitting

`cert-name` and `cert-course` carry their fitting rules as data attributes:

| Attribute | Meaning |
|---|---|
| `data-max-width` | Widest a line may be, in viewBox units |
| `data-one-line-min` | Smallest font size allowed on one line |
| `data-two-line-max` / `data-two-line-min` | Font size range once the text splits into two lines |
| `data-line-gap` | Gap between the two lines at `two-line-max` |
| `data-gap-target` | Group below the text that moves when the gap shrinks with the font |
| `data-moves-one` / `data-moves-two` | `id:dy` pairs, comma-separated, applied as `translate(0 dy)` in each case |
| `data-prefer-two` | `true` splits any text with more than one word (unused in v3) |

The rule, in `fit()`:

1. Shrink the font by 2 at a time until the text fits `data-max-width` or reaches `data-one-line-min`.
2. If it fits, or it is a single word, stop and apply `data-moves-one`.
3. Otherwise split at the word break that makes the two lines closest in character count, set the size to `data-two-line-max`, and shrink by 2 until the wider line fits or the size reaches `data-two-line-min`.
4. Apply `data-moves-two`, then scale the line gap with the fitted size and move `data-gap-target` up by the difference.

`fit()` measures with `getComputedTextLength()`, so the SVG must be in the document and `document.fonts.ready` must have resolved first. Measuring before the embedded fonts load gives widths from a fallback font.

Test strings used when the template was designed:

| Name | Course | Partner |
|---|---|---|
| Ananya Krishnan | Introduction to Quantum Computing | yes |
| Venkatasubramanian Ramakrishnan | Quantum Algorithms, Error Correction and Programming with Qiskit | yes |
| Rahul Mehta | Introduction to Quantum Computing | no |
| Prayash | Introduction to Quantum Computing | no |
