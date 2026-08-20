---
name: Drizzle inArray vs raw ANY()
description: Why raw sql`= ANY(${array})` fails and how to fix it in Drizzle ORM
---

When using Drizzle ORM, passing a JS array into a raw SQL template literal with `= ANY()` generates invalid PostgreSQL:

```ts
// BAD — generates: WHERE id = ANY($1, $2, $3) — invalid syntax
.where(sql`${table.id} = ANY(${authorIds})`)

// GOOD — generates: WHERE id = ANY(ARRAY[$1, $2, $3]) — correct
import { inArray } from "drizzle-orm";
.where(inArray(table.id, authorIds))
```

**Why:** Drizzle treats the array as positional parameters expanded inline, not as a PostgreSQL array literal. `= ANY()` requires a proper array operand.

**How to apply:** Any time you need to filter a column by a list of IDs or values in Drizzle, use `inArray(column, values)` rather than raw SQL with `ANY`.
