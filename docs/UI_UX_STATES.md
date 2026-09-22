# UI / UX State Hierarchy

The gameplay UI is split into four explicit states.

## 1. Gameplay HUD
Visible during Running and Recovering.
Keep persistent information minimal: run score/progress, balance/tension feedback and one contextual action area.

## 2. Recovery Prompt
Appears only during Recovering.
This is an in-run microinteraction, not a modal game-over screen.
- one primary action: Recover;
- short countdown;
- strong visual urgency;
- gameplay remains visible;
- movement is slowed and jumping is disabled.

## 3. Fall / Rescue Card
Appears only after the fall impact beat has completed.
- clear fall status;
- 10-second decision timer;
- one primary rescue/continue action;
- secondary exit/game-over action;
- perimeter countdown is a dedicated visual target, not a generic radial fill.

## 4. Final Game Over
Appears after rescue timeout or explicit exit.
This state owns score summary, rewards, restart and home navigation.

## Mobile-first rules
- safe-area aware layout;
- primary buttons sized for thumbs;
- no essential action hidden behind small corner controls;
- Recovery and Rescue must use visibly different presentation;
- reduced-motion mode should replace large camera/scale animation with opacity and concise feedback.
