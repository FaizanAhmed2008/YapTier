# Contributing to YapTier

Thanks for wanting to contribute! YapTier is an open-source, ad-free tier list maker, and every contribution helps.

## How to contribute

1. **Fork the repository** and create a branch from `main`.
2. **Set up the project** locally:

   ```bash
   npm install
   npm run dev
   ```

3. **Make your changes.** Keep them small and focused on a single concern.
4. **Run checks:**

   ```bash
   npm run typecheck
   npm test
   npm run build
   ```

5. **Commit** with a descriptive message (conventional commit style preferred, e.g. `feat: ...`, `fix: ...`, `docs: ...`).
6. **Open a pull request** against `main` describing what changed and why.

## Guidelines

- Do not introduce unnecessary dependencies. YapTier keeps its dependency list intentionally small.
- Preserve existing working functionality; do not rebuild features that already work.
- Keep the UI dark-themed, compact, and responsive on desktop, tablet, and mobile.
- All new user-facing strings should be short and beginner-friendly.
- Add or update tests for new behavior.
- Never commit secrets, API keys, or credentials.
- Do not mention AI coding tool names in source code, documentation, comments, or commit messages.

## Licensing

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE). Third-party icons and images remain under their respective collection licenses.
