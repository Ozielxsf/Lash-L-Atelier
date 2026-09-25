#!/usr/bin/env python3
"""
Build the site's legal pages from the Wallink Systems templates.

    python3 scripts/build-legal.py <path-to-wallink-legal-dir>

Writes content/legal/{privacy,terms,accessibility}.md. Re-run whenever the
site starts collecting something new (booking, accounts, orders, payments):
flip the matching KEEP_* flag below and the processor list, then re-run, and
bump EFFECTIVE_DATE. A policy that describes things the site doesn't do is
worse than one that's tailored — and so is one that omits what it does.
"""
import re, sys, pathlib

SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "../wallink-systems/legal")
OUT = pathlib.Path(__file__).resolve().parent.parent / "content" / "legal"

BUSINESS_NAME = "Lash L’Atelier"
WEBSITE_URL = "lashlatelier.com"
PHONE = "(724) 467-3479"
ADDRESS = "26 Campbell Street, Hickory, PA 15312"
EFFECTIVE_DATE = "September 25, 2026"   # ⚠️ set to the launch date
STATE, COUNTY = "Pennsylvania", "Washington County"

# What the site does today. The shop (phase 3) will turn on orders + payments.
KEEP_ACCOUNTS = False
KEEP_ORDERS = False
KEEP_MARKETING = False
KEEP_PAYMENTS = False
KEEP_ARBITRATION = True
# Online booking is built and deployed (switched on from /admin), so the
# processors behind it are listed: Supabase stores requests, Resend sends the
# emails, Upstash rate-limits the form, Cloudflare Turnstile guards it.
PROCESSORS_IN_USE = {"Vercel", "Cloudflare", "Wallink Systems", "Supabase", "Resend", "Upstash"}

CONTACT_INLINE = f"{PHONE} or in writing at {ADDRESS}"


def strip_block(text: str, marker: str, keep: bool) -> str:
    """Remove (or unwrap) an <!-- OPTIONAL ... marker ... --> … <!-- END OPTIONAL … --> block."""
    pattern = re.compile(
        r"[ \t]*<!-- OPTIONAL[^>]*?" + re.escape(marker) + r"[\s\S]*?-->\n([\s\S]*?)[ \t]*<!-- END OPTIONAL[^>]*-->\n?",
        re.I,
    )
    return pattern.sub(lambda m: m.group(1) if keep else "", text)


def fill(text: str) -> str:
    # Email isn't published yet — route every "email us" to phone / post instead.
    text = re.sub(r"^- \*\*Email:\*\* \{\{BUSINESS_EMAIL\}\}\n", "", text, flags=re.M)
    text = text.replace("{{BUSINESS_EMAIL}} · {{BUSINESS_PHONE}}", "{{BUSINESS_PHONE}}")
    text = text.replace("contact us at {{BUSINESS_EMAIL}}", f"contact us by phone at {CONTACT_INLINE}")
    text = text.replace("contacting us at {{BUSINESS_EMAIL}}", f"contacting us by phone at {CONTACT_INLINE}")
    for k, v in {
        "BUSINESS_NAME": BUSINESS_NAME,
        "WEBSITE_URL": WEBSITE_URL,
        "BUSINESS_PHONE": PHONE,
        "BUSINESS_ADDRESS": ADDRESS,
        "EFFECTIVE_DATE": EFFECTIVE_DATE,
        "GOVERNING_STATE": STATE,
        "GOVERNING_COUNTY": COUNTY,
    }.items():
        text = text.replace("{{" + k + "}}", v)
    leftover = re.findall(r"\{\{[A-Z_]+\}\}", text)
    if leftover:
        sys.exit(f"Unfilled placeholders: {sorted(set(leftover))}")
    return text


def processors(text: str) -> str:
    def keep(line: str) -> bool:
        m = re.match(r"\s*- \*\*[^*]+:\*\* (\w[\w ]*?)(?: \(|$)", line)
        if not m or "(" not in line:
            return True
        name = m.group(1).strip()
        return any(name.startswith(p) for p in PROCESSORS_IN_USE)
    lines = text.split("\n")
    out, in_list = [], False
    for line in lines:
        if line.startswith("- **Service providers"):
            in_list = True
        elif in_list and line.startswith("- **"):
            in_list = False
        if in_list and line.startswith("  - **") and not keep(line):
            continue
        out.append(line)
    text = "\n".join(out)
    return re.sub(r"\n\*Note: adjust[^\n]*\*\n", "\n", text)


def renumber(text: str) -> str:
    mapping, n = {}, 0
    def head(m):
        nonlocal n
        n += 1
        mapping[m.group(1)] = str(n)
        return f"## {n}. "
    text = re.sub(r"^## (\d+)\. ", head, text, flags=re.M)
    return re.sub(r"Section(\s+)(\d+)", lambda m: f"Section{m.group(1)}{mapping.get(m.group(2), m.group(2))}", text)


def finish(text: str) -> str:
    # The template's closing note is advice to the business owner, not to visitors.
    text = re.sub(r"\n---\n\n\*This (document|statement) is a starting template[\s\S]*$", "\n", text)
    text = re.sub(r"<!--[\s\S]*?-->\n?", "", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"


def build(name: str, out: str):
    t = (SRC / name).read_text()
    t = strip_block(t, "orders/accounts", KEEP_ORDERS or KEEP_ACCOUNTS)
    t = strip_block(t, "marketing", KEEP_MARKETING)
    t = strip_block(t, "payments", KEEP_PAYMENTS)
    t = strip_block(t, "user accounts", KEEP_ACCOUNTS)
    t = strip_block(t, "orders, products", KEEP_ORDERS)
    t = strip_block(t, "arbitration", KEEP_ARBITRATION)
    t = strip_block(t, "keep this notice", KEEP_ARBITRATION)
    t = processors(fill(t))
    t = finish(renumber(t))
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / out).write_text(t)
    print(f"wrote content/legal/{out} ({len(t.splitlines())} lines)")


build("privacy-policy.md", "privacy.md")
build("terms-of-service.md", "terms.md")
build("accessibility-statement.md", "accessibility.md")
