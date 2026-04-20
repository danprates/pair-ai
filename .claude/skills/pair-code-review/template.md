There are some points of attention in the code:

**Nomenclature:**

**1. Variables with generic names**
The variables `e` and `c` are too generic and do not communicate the purpose of the code.
I suggest renaming `e` to `exchange` and `c` to `chart` for better clarity.

```javascript
// src/index.js
- const e = new BinanceExchange();
- const c = new Chart(e);
+ const exchange = new BinanceExchange();
+ const chart = new Chart(exchange);
```

**Functionality:**

**2. Inverted assignment in `Candle` constructor**
There is an inversion in the assignment of `close` and `open` values.
The value passed to `close` is being assigned to `this.open`, and vice versa.
This can lead to errors in business logic that depends on these values.

```javascript
// src/candle.js
- this.close = open;
- this.open = close;
+ this.close = close;
+ this.open = open;
```

---

## Format rules (must be preserved in any override)

- Issues are numbered **globally** starting at 1 (`**1. ...**`, `**2. ...**`, `**3. ...**`), never reset per category.
- Category names are bold headings above the group of issues they contain.
- Numbering stays continuous across categories (a category may contain issues 5–7, the next may start at 8).
- Each issue has: a bold numbered title, a short explanation, and (when applicable) a code block showing the before/after diff with the file path as a comment.
- Output is markdown. Feedback is objective, in the requested language, and only lists problems — not things that work correctly.
