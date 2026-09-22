# Unity Bootstrap

The repository is pinned to Unity 6000.0.23f1.

## Open

1. Clone the repository.
2. Open the repository root in Unity Hub with Unity 6000.0.23f1.
3. Allow Unity to restore packages from `Packages/manifest.json`.
4. Run EditMode tests before gameplay work.

## Current foundation

The project now has deterministic editor/package configuration and automated EditMode coverage for the core balance and run-state systems.

A production prototype scene and prefabs remain the next asset-authoring task. They should be created in Unity so their generated `.meta` GUIDs are committed together with the assets.
