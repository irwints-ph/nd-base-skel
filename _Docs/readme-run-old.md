tsconfig.json already have "noEmit": true,

tsc --noEmit
tsc --outDir build

### Typical workflow comparison

| C# / .NET          | TypeScript                            | TypeScript                            |
| ------------------ | ------------------------------------- | ------------------------------------- |
| `dotnet run`       | `tsx src/main.ts`                     | `npm run dev`                         |
| `dotnet watch run` | `tsx watch src/main.ts`               | `npm run watch`                       |
| `dotnet build`     | `tsc` or `tsc --noEmit`               | `npm run check`                       |
| `dotnet publish`   | `tsc` + bundler (e.g. esbuild / Vite) | `tsc` + bundler (e.g. esbuild / Vite) |

---

💡 **Key idea:**

* **`tsx` = run TypeScript directly (no build step)**
* **`tsc` = actual compile/build step**

You **don’t need to modify `tsconfig.json`** if you just want to override settings for a single command. The **TypeScript compiler (`tsc`)** lets you override many `tsconfig` options via CLI flags.

## 1️⃣ Equivalent of `.NET build` check (compile but don’t emit)

Use:

```bash
tsc --noEmit
```

* Type-checks the project
* **Produces no `.js` files**
* Uses the existing `tsconfig.json`

This is commonly used in CI or pre-commit checks.

Example with project:

```bash
tsc -p tsconfig.json --noEmit
```

---

## 2️⃣ Override output directory without editing `tsconfig.json`

```bash
tsc --outDir build
```

or

```bash
tsc -p tsconfig.json --outDir build
```

This **temporarily overrides** the `outDir` defined in `tsconfig.json`.

---

## 3️⃣ Common pattern (build + separate typecheck)

Many projects do:

```bash
# type check only
tsc --noEmit

# build
tsc --outDir dist
```

or in **`package.json`**:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsc --outDir dist"
  }
}
```

---

✅ **Summary**

| Goal                 | Command                |
| -------------------- | ---------------------- |
| Type check only      | `tsc --noEmit`         |
| Build using tsconfig | `tsc`                  |
| Override output dir  | `tsc --outDir dist`    |
| Specify project      | `tsc -p tsconfig.json` |

---

💡 **Tip:** If you're using **tsx** for running TS directly, a very common setup is:

```bash
tsx src/main.ts     # run
tsc --noEmit        # typecheck
tsc --outDir dist   # build
```

---

If you want, I can also show a **clean “.NET-style” workflow for TypeScript** (`run`, `watch`, `build`, `publish`) that feels very similar to the **`dotnet` CLI**.
