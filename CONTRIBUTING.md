# Contributing

## Branch workflow

- `main` is the deployable/default branch.
- Work starts on a focused feature or documentation branch.
- Open a pull request into `main` when the work is complete enough to review.
- Review the diff and checks before merging.
- Do not edit `main` directly for normal project work.

## Content workflow

For fundraiser information:

1. Update `docs/fundraisers.md` with the evidence first.
2. Mark the verification state and `verifiedAt` date in the eventual data model.
3. Update website data/content from the verified source register.
4. Keep the original campaign URL visible and inspectable.

Do not publish new campaign amounts, beneficiary claims, money-flow claims, or social-media claims from memory or assumption.

## Scope discipline

The initial product is a static information site. Avoid adding a backend, authentication, database, or automatic campaign scraping unless a documented requirement is added to the roadmap first.
