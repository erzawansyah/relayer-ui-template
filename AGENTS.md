# AGENTS.md

Single source of instructions for AI coding agents working in this repo.

## Project summary

`relayer-ui-template` is a contract-agnostic React UI for FHEVM (Zama) contracts. It loads contracts from `public/contracts/` (index + ABI + metadata) and lets users run read/write functions with encrypted inputs and decrypted outputs. It is consumed by `fhevm-starterkit`, which clones this repo at a pinned commit into generated projects as `ui/`.

Frozen on FHEVM 0.9 / relayer-sdk `0.3.0-5`. The Sepolia relayer no longer works with this SDK version; only local mode (Hardhat chain 31337, `@fhevm/mock-utils`) is supported. Do not upgrade FHEVM or the relayer SDK unless the maintainer asks.

## Stack

Vite 7, React 19 + React Compiler, TypeScript 5.9, Tailwind 4, shadcn/ui (base-ui, radix), wagmi 2, viem, RainbowKit, ethers 6, TanStack Query. Relayer SDK is loaded from the Zama CDN (`src/lib/fhevm/internal/constants.ts`).

## Commands

```bash
npm ci                                   # install
npm run dev                              # dev server
VITE_WALLETCONNECT_PROJECT_ID=dummy npm run build   # type-check + build
npm run lint                             # ESLint, must be 0 errors
```

No automated tests yet.

## Structure

- `src/components/` app components; `src/components/ui/` shadcn primitives (generated, keep edits minimal).
- `src/context/`, `src/hooks/` contract loading, encryption, decryption, input handling.
- `src/lib/fhevm/` derived from zama-ai/fhevm-react-template, BSD-3-Clause-Clear. Do not change without a clear reason, and keep its `LICENSE` file.
- `src/types/metadata.d.ts` contract metadata schema shared with `fhevm-starterkit`.
- `public/contracts/` filled by `fhevm-starterkit` (`index.json`, `<slug>/abi.json`, `<slug>/metadata.json`).

## Conventions

- TypeScript strict, function components and hooks.
- Keep the metadata format compatible with `fhevm-starterkit` (it pins a commit of this repo).
- Conventional commits.

## Do not

- Commit `.env.local` or any real WalletConnect project ID.
- Commit generated contract files under `public/contracts/` (only `.gitkeep` is tracked).
- Rename or move this repo: `fhevm-starterkit/starterkit.config.ts` references its URL.
