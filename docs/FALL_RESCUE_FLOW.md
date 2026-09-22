# Fall & Rescue Flow

## Goal

A collision should create tension before failure. The player gets a readable sequence:

1. Impact
2. Balance loss
3. Stumble / critical state
4. Recovery opportunity
5. Fall
6. Slow-motion impact
7. 10-second rescue window
8. Rescue or final game over

## Why

The HTML prototype already proved that a 10-second post-fail decision window creates urgency. The production version keeps that idea, but places it after the richer balance/recovery system.

## Presentation target

When the rescue window opens:

- freeze the normal HUD hierarchy;
- show Granny's current state first;
- display the countdown as a perimeter timer around the card;
- primary action: rescue / continue;
- secondary action: return to home / accept game over;
- use unscaled time so slow motion or pause states do not break the countdown.

## Technical notes

- FallController owns fall state and impact slow motion.
- RescueWindowController owns the unscaled 10-second countdown.
- RescuePanelController owns visual UI binding only.
- Economy costs for rescue are deliberately not hard-coded into the core rescue system. Monetization and progression decisions can be layered later without coupling gameplay code to currency.
