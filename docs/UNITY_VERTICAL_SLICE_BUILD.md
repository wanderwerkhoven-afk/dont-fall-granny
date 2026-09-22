# Unity Vertical Slice Build

This repository now includes an editor bootstrap command for the first in-engine prototype.

## Build the scene

Open the project in Unity 6000.0.23f1.

From the menu choose:

**Don’t Fall Granny → Build Vertical Slice Prototype**

The tool creates:

- `Assets/Scenes/VerticalSlice.unity`
- `Assets/Prefabs/GrannyPrototype.prefab`
- `Assets/Art/VisualDirectionProfile.asset`
- prototype materials under `Assets/Art/Materials`

## Scene contents

The generated scene contains:

- prototype Granny hierarchy;
- Rigidbody/collider and all current core gameplay components;
- suburban-street blockout;
- prototype obstacles;
- directional lighting;
- runner camera with tension-state FOV behavior;
- front-end UI hierarchy;
- gameplay HUD / Recovery / Rescue / Game Over groups.

## Intent

This is a greybox-plus visual validation scene.

It is not final art.

Its purpose is to make the existing game systems inspectable in Unity and provide a concrete base for:

- compile validation;
- Play Mode testing;
- animation integration;
- material/lighting iteration;
- mobile UI layout;
- Design + Visual Agent review.

## After generation

Commit the Unity-generated assets together with their `.meta` files.

Then run the EditMode test suite and verify the scene in Play Mode before merging the foundation branch.
