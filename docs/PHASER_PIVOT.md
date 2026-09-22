# Phaser + TypeScript pivot

Decision: the production implementation of Don’t Fall Granny is browser-native.

## Why

The project should be:

- playable directly through GitHub Pages;
- easy to test from phone or desktop;
- independent of Unity installation and licensing;
- fast to iterate through GitHub-only workflows;
- lightweight enough for frequent builds and reviews.

## Mapping from the Unity prototype

- `GameSessionFlowController` → Phaser scene flow;
- `RunDataController` → `RunData.ts`;
- `BalanceController` → `BalanceSystem.ts`;
- `GrannyRunnerController` → `GameScene` runner physics;
- Recovery / Fall / Rescue → explicit `RunState` flow inside `GameScene`;
- Unity Canvas UI → Phaser display objects;
- Unity WebGL/GameCI → Vite + GitHub Actions Pages deployment.

## Legacy Unity code

The old Unity folders are retained temporarily as reference while systems are ported. They are not part of the web build and can be removed once the Phaser implementation has reached feature parity.
