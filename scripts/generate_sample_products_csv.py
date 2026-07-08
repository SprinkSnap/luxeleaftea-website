#!/usr/bin/env python3
"""Generate docs/SAMPLE_PRODUCTS_IMPORT.csv with full product descriptions."""

import csv
from pathlib import Path

NUTRITION_FOOTER = (
    '<p><em>Per 8 fl oz (240 ml) prepared tea — 3g loose leaf, no milk or sweetener. '
    'Values are approximate. Caffeine varies with steep time and leaf amount.</em></p>'
)


def nutrition_table(caffeine: str) -> str:
    rows = [
        ("Calories", "0"),
        ("Total Fat", "0 g"),
        ("Sodium", "0 mg"),
        ("Total Carbohydrate", "0 g"),
        ("Protein", "0 g"),
        ("Caffeine", caffeine),
    ]
    body = "".join(f"<tr><td>{label}</td><td>{value}</td></tr>" for label, value in rows)
    return f"<h3>Nutrition facts</h3><table><tbody>{body}</tbody></table>{NUTRITION_FOOTER}"


def body(*parts: str) -> str:
    return "".join(parts)


PRODUCTS = [
    {
        "Handle": "dragon-well-green-tea",
        "Title": "Dragon Well Green Tea",
        "Body (HTML)": body(
            "<p>Bright, sweet premium loose leaf green tea with a classic chestnut aroma and clean finish. "
            "Hand-selected whole leaves from Zhejiang — perfect for daily ritual.</p>",
            "<p><strong>Origin:</strong> Zhejiang Province, China<br>"
            "<strong>Best for:</strong> Morning and afternoon sipping</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 3g per 150ml water (about 1 tsp)</li>"
            "<li><strong>Water:</strong> 175–185°F (80–85°C)</li>"
            "<li><strong>Steep:</strong> 1–2 minutes</li>"
            "<li><strong>Re-steeps:</strong> 3–4 infusions — add 15–30 seconds each time</li>"
            "</ul>",
            nutrition_table("25–35 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Tea",
        "Tags": "green-tea, Green Tea",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-GREEN-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "18.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Dragon Well Green Tea | Premium Loose Leaf Tea | Luxe Leaf Tea",
        "SEO Description": "Shop Dragon Well premium loose leaf green tea — bright sweet whole leaves packed fresh to order.",
        "Image Asset": "luxe-leaf-green-tea-product-2.png",
    },
    {
        "Handle": "tieguanyin-oolong",
        "Title": "Tieguanyin Oolong",
        "Body (HTML)": body(
            "<p>Floral, creamy premium loose leaf oolong with orchid notes and a soft, layered cup. "
            "Rolled leaves that unfurl beautifully across multiple steeps.</p>",
            "<p><strong>Origin:</strong> Fujian Province, China<br>"
            "<strong>Best for:</strong> Slow sipping and re-steeping</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 4g per 150ml water</li>"
            "<li><strong>Water:</strong> 195–205°F (90–96°C)</li>"
            "<li><strong>Steep:</strong> 2–3 minutes</li>"
            "<li><strong>Re-steeps:</strong> 4–6 infusions — shorten first re-steep slightly</li>"
            "</ul>",
            nutrition_table("30–40 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Tea",
        "Tags": "oolong, Oolong",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-OOLONG-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "22.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Tieguanyin Oolong | Premium Loose Leaf Tea | Luxe Leaf Tea",
        "SEO Description": "Shop Tieguanyin premium loose leaf oolong — floral layered whole leaves packed fresh to order.",
        "Image Asset": "luxe-leaf-oolong-tea-product-2.png",
    },
    {
        "Handle": "aged-yunnan-puerh",
        "Title": "Aged Yunnan Pu-erh",
        "Body (HTML)": body(
            "<p>Deep, smooth premium loose leaf pu-erh with earthy cocoa notes and a naturally sweet finish. "
            "Selected for richness across many infusions.</p>",
            "<p><strong>Origin:</strong> Yunnan Province, China<br>"
            "<strong>Best for:</strong> Mindful breaks and daily ritual</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 4–5g per 150ml water</li>"
            "<li><strong>Water:</strong> 205–212°F (96–100°C)</li>"
            "<li><strong>Rinse:</strong> 20–30 seconds, discard water</li>"
            "<li><strong>Steep:</strong> 2–3 minutes after rinse</li>"
            "<li><strong>Re-steeps:</strong> 6–8 infusions</li>"
            "</ul>",
            nutrition_table("30–45 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Tea",
        "Tags": "pu-erh, Pu-erh",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-PUERH-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "24.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Aged Yunnan Pu-erh | Premium Loose Leaf Tea | Luxe Leaf Tea",
        "SEO Description": "Shop aged Yunnan premium loose leaf pu-erh — deep smooth tea ideal for re-steeping.",
        "Image Asset": "luxe-leaf-puerh-tea-product-2.png",
    },
    {
        "Handle": "keemun-black-tea",
        "Title": "Keemun Black Tea",
        "Body (HTML)": body(
            "<p>Rich, malty premium loose leaf black tea with cocoa depth and a polished, copper-bright liquor. "
            "Full-bodied and satisfying.</p>",
            "<p><strong>Origin:</strong> Anhui Province, China<br>"
            "<strong>Best for:</strong> Morning ritual</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 3g per 150ml water</li>"
            "<li><strong>Water:</strong> 200–212°F (93–100°C)</li>"
            "<li><strong>Steep:</strong> 3–4 minutes</li>"
            "<li><strong>Re-steeps:</strong> 2–3 infusions</li>"
            "</ul>",
            nutrition_table("40–70 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Tea",
        "Tags": "black-tea, Black Tea",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-BLACK-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "16.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Keemun Black Tea | Premium Loose Leaf Tea | Luxe Leaf Tea",
        "SEO Description": "Shop Keemun premium loose leaf black tea — rich malty whole leaves packed fresh to order.",
        "Image Asset": "luxe-leaf-black-tea-product-2.png",
    },
    {
        "Handle": "yunnan-ctc-black-tea",
        "Title": "Yunnan CTC Black Tea",
        "Body (HTML)": body(
            "<p>Bold, earthy Yunnan CTC black tea — crush-tear-curl loose leaf that brews fast and strong. "
            "Deep reddish liquor with a malty, slightly peppery finish. Built for milk tea, masala chai, and bubble tea bases.</p>",
            "<ul>"
            "<li><strong>Fast and bold</strong> — CTC leaf infuses quickly for café-speed batches</li>"
            "<li><strong>Earthy and malty</strong> — Rich body that holds up to milk and sweetener</li>"
            "<li><strong>Blend-friendly</strong> — Pairs with Assam, Fujian, and house blends</li>"
            "</ul>",
            "<p><strong>Origin:</strong> Yunnan Province, China — high-elevation gardens<br>"
            "<strong>Best for:</strong> Milk tea, chai, bubble tea, strong breakfast cups</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Hot cup:</strong> 3g per 150ml · 205–212°F · 3–4 minutes</li>"
            "<li><strong>Milk tea / chai batch:</strong> 50g per 2L · just off boil · steep 10–15 minutes · strain · add milk and sweetener</li>"
            "<li><strong>Tip:</strong> CTC brews faster than whole leaf — taste at 8 minutes for bubble tea batches</li>"
            "</ul>",
            nutrition_table("50–80 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Black Tea",
        "Tags": "black-tea, bubble-tea, ctc, yunnan, bestseller",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "100g",
        "Variant SKU": "LL-YUN-CTC-100",
        "Variant Grams": "100",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "19.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Yunnan CTC Black Tea for Milk Tea & Chai | Luxe Leaf Tea",
        "SEO Description": "Bold earthy Yunnan CTC loose leaf — fast-brewing base for milk tea chai and bubble tea. Packed fresh to order.",
        "Image Asset": "yunnan-ctc-black-tea-product-2.png",
    },
    {
        "Handle": "fujian-black-tea",
        "Title": "Fujian Black Tea",
        "Body (HTML)": body(
            "<p>Smooth Fujian black tea with natural honey sweetness, soft cocoa, and light florals. "
            "Handpicked loose leaf — mellow enough to sip straight, refined enough to lift premium blends.</p>",
            "<ul>"
            "<li><strong>Naturally sweet</strong> — Honey, cocoa, and floral notes without harshness</li>"
            "<li><strong>Artisan origin</strong> — Misty Fujian highlands, carefully oxidized whole leaf</li>"
            "<li><strong>Blend-ready</strong> — Softens bold teas; shines in fruit and milk tea builds</li>"
            "</ul>",
            "<p><strong>Origin:</strong> Fujian Province, China<br>"
            "<strong>Best for:</strong> Straight sipping, fruit teas, milk tea blends, custom house mixes</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Hot cup:</strong> 3g per 150ml · 200–205°F · 3 minutes</li>"
            "<li><strong>Blending:</strong> Use 20–40% Fujian with Assam or Yunnan CTC for softer, sweeter milk tea</li>"
            "<li><strong>Re-steeps:</strong> 2–3 infusions</li>"
            "</ul>",
            nutrition_table("35–50 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Black Tea",
        "Tags": "black-tea, fujian, blend-friendly",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-FJ-BLACK-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "18.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Fujian Black Tea — Smooth Honey Loose Leaf | Luxe Leaf Tea",
        "SEO Description": "Premium Fujian black tea — honey-sweet floral loose leaf for sipping or blending. Smooth milk tea base. Fresh packed.",
        "Image Asset": "fujian-black-tea-product-2.png",
    },
    {
        "Handle": "premium-assam-black-tea",
        "Title": "Premium Assam Black Tea",
        "Body (HTML)": body(
            "<p><strong>Bold. Malty. Full-bodied.</strong> Wake up to the rich, satisfying taste of our Premium Assam Black Tea — "
            "expertly blended from high-quality Yunnan CTC and smooth Fujian black tea. Deep amber cup, bold malty aroma, "
            "rich body, and an exceptionally smooth finish that lingers after every sip.</p>",
            "<p>Classic breakfast tea, creamy milk tea, masala chai, or refreshing iced tea — this versatile loose leaf blend "
            "delivers outstanding flavor, consistency, and quality in every brew.</p>",
            "<h3>Why you&rsquo;ll love it</h3><ul>"
            "<li>Bold, full-bodied black tea with a naturally rich malty flavor</li>"
            "<li>Smooth, mellow finish with a pleasant long-lasting aftertaste</li>"
            "<li>Expert blend of premium Yunnan CTC and Fujian black teas</li>"
            "<li>Brews quickly while maintaining exceptional depth and aroma</li>"
            "<li>Delicious hot or iced — perfect for milk tea, bubble tea, and chai</li>"
            "</ul>",
            "<h3>Flavor profile</h3><ul>"
            "<li><strong>Taste:</strong> Bold, rich, malty, smooth</li>"
            "<li><strong>Aroma:</strong> Warm, earthy, lightly sweet</li>"
            "<li><strong>Body:</strong> Full-bodied</li>"
            "<li><strong>Finish:</strong> Clean, mellow, lingering</li>"
            "</ul>",
            "<p><strong>Origin:</strong> Yunnan CTC + Fujian Province, China — premium Chinese black tea blend<br>"
            "<strong>Best for:</strong> Breakfast tea, milk tea, bubble tea, masala chai, iced tea, caf&eacute; use</p>",
            "<h3>Premium tea origins</h3>"
            "<p><strong>Yunnan CTC</strong> — Bold strength, rich color, and deep body from renowned Yunnan mountains. "
            "Fast infusion makes it an excellent foundation for milk tea and chai.</p>"
            "<p><strong>Fujian black tea</strong> — Floral aroma, gentle honey sweetness, and remarkable smoothness "
            "that balances the strength of the Yunnan tea.</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 2–3g per 150ml (about 1 teaspoon)</li>"
            "<li><strong>Water:</strong> 203–212°F (95–100°C)</li>"
            "<li><strong>Steep:</strong> 3–5 minutes — adjust to taste</li>"
            "<li><strong>Milk tea / chai:</strong> 50g per 2L · just off boil · 10–15 minutes · strain · add milk and sweetener</li>"
            "<li><strong>Re-steeps:</strong> 2–3 infusions</li>"
            "</ul>",
            "<p>Every batch is carefully selected for consistent flavor, vibrant aroma, and premium quality — "
            "the bold character and dependable performance tea lovers expect.</p>",
            nutrition_table("45–70 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Black Tea",
        "Tags": "black-tea, assam, blend, bubble-tea, milk-tea, breakfast, bestseller",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "100g",
        "Variant SKU": "LL-ASSAM-100",
        "Variant Grams": "100",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "22.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Premium Assam Black Tea Loose Leaf | Malty Breakfast Blend | Luxe Leaf Tea",
        "SEO Description": "Bold malty Assam-style loose leaf black tea — Yunnan CTC and Fujian blend for breakfast, milk tea, chai, and bubble tea. Packed fresh to order.",
        "Image Asset": "premium-assam-black-tea-product-2.png",
    },
    {
        "Handle": "premium-jasmine-green-tea",
        "Title": "Premium Jasmine Green Tea",
        "Body (HTML)": body(
            "<p><strong>Naturally scented · Fresh floral aroma · Smooth &amp; refreshing</strong></p>",
            "<p>Experience authentic Chinese jasmine tea crafted from spring-harvested "
            "<strong>Yunnan Maojian green tea</strong> and naturally scented with fresh "
            "<strong>Guangxi jasmine blossoms</strong>. Using a traditional multi-layer scenting process, "
            "fragrant jasmine flowers are carefully layered with premium green tea leaves over multiple rounds, "
            "allowing the delicate floral aroma to infuse naturally — without artificial flavors or oils.</p>",
            "<p>The result is an exceptionally smooth, refreshing loose leaf tea with a clean finish, "
            "gentle sweetness, and a captivating jasmine fragrance in every cup.</p>",
            "<h3>Why you&rsquo;ll love it</h3><ul>"
            "<li>Naturally scented with real Guangxi jasmine blossoms</li>"
            "<li>Premium Yunnan Maojian green tea harvested in early spring</li>"
            "<li>Delicate floral aroma with naturally sweet notes</li>"
            "<li>Smooth, refreshing taste with low bitterness and low astringency</li>"
            "<li>No artificial flavors, fragrances, or additives</li>"
            "<li>Perfect for hot tea, iced tea, fruit tea, milk tea, and cold brew</li>"
            "</ul>",
            "<h3>Flavor profile</h3><ul>"
            "<li><strong>Aroma:</strong> Fresh jasmine blossoms with an elegant floral bouquet</li>"
            "<li><strong>Taste:</strong> Smooth, lightly sweet, fresh vegetal notes balanced by delicate jasmine</li>"
            "<li><strong>Body:</strong> Light to medium-bodied</li>"
            "<li><strong>Finish:</strong> Clean, crisp, refreshing, and beautifully lingering</li>"
            "</ul>",
            "<p><strong>Origin:</strong> Yunnan Maojian green tea + Guangxi jasmine blossoms, China<br>"
            "<strong>Best for:</strong> Daily sipping, iced jasmine tea, fruit tea, milk tea, gifts, and caf&eacute; service</p>",
            "<h3>How to brew</h3><ul>"
            "<li><strong>Leaf:</strong> 2–3g (1 teaspoon) per 150ml</li>"
            "<li><strong>Water:</strong> 80–85°C (175–185°F)</li>"
            "<li><strong>Steep:</strong> 2–3 minutes</li>"
            "<li><strong>Re-steeps:</strong> 2–3 infusions</li>"
            "<li><strong>Tip:</strong> Avoid boiling water for the most delicate floral aroma</li>"
            "</ul>",
            "<p>Every batch combines carefully selected Yunnan Maojian green tea with naturally fragrant "
            "Guangxi jasmine blossoms using a traditional scenting method perfected over generations — "
            "authentic Chinese jasmine tea with remarkable freshness, elegance, and balance.</p>",
            nutrition_table("25–35 mg"),
        ),
        "Vendor": "Luxe Leaf Tea",
        "Type": "Tea",
        "Tags": "green-tea, jasmine, jasmine-tea, Green Tea, bestseller",
        "Published": "TRUE",
        "Option1 Name": "Size",
        "Option1 Value": "50g",
        "Variant SKU": "LL-JASMINE-50",
        "Variant Grams": "50",
        "Variant Inventory Tracker": "shopify",
        "Variant Inventory Qty": "100",
        "Variant Inventory Policy": "deny",
        "Variant Fulfillment Service": "manual",
        "Variant Price": "20.00",
        "Variant Requires Shipping": "TRUE",
        "Variant Taxable": "TRUE",
        "Status": "active",
        "SEO Title": "Premium Jasmine Green Tea Loose Leaf | Naturally Scented | Luxe Leaf Tea",
        "SEO Description": "Naturally scented jasmine green tea — Yunnan Maojian and Guangxi jasmine blossoms. Smooth floral loose leaf for hot, iced, and milk tea. Packed fresh to order.",
        "Image Asset": "luxe-leaf-green-tea-product-2.png",
    },
]

FIELDNAMES = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant SKU",
    "Variant Grams",
    "Variant Inventory Tracker",
    "Variant Inventory Qty",
    "Variant Inventory Policy",
    "Variant Fulfillment Service",
    "Variant Price",
    "Variant Requires Shipping",
    "Variant Taxable",
    "Status",
    "SEO Title",
    "SEO Description",
]


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "docs" / "SAMPLE_PRODUCTS_IMPORT.csv"
    rows = [{k: p[k] for k in FIELDNAMES} for p in PRODUCTS]
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} products to {out}")


if __name__ == "__main__":
    main()
