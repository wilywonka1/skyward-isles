# skyward-isles

[![make.fun · best-flight-game-20261126-0057](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/wilywonka1/skyward-isles/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/wilywonka1/skyward-isles/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057?utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057)

Skyward Isles is an original browser flight game, built for make.fun's "Make the best flight game" bounty ($500 in USDC). Fly a small prop plane in chase or cockpit view over an original island — green hills, sandy shores, a blue bay, two airstrips, trees, villages and clouds — with a flight model that rewards throttle and turn discipline: pitch, roll and rudder, stalls at low speed, ground effect near the runway, fuel that burns and a hull that takes damage from hard impacts.

Three missions with different goals:

1. **Ring Runner** — thread 6 golden rings over the bay.
2. **Cargo Run** — take off from North Field and land at South Strip before fuel runs low.
3. **Precision Landing** — approach South Strip and touch down gently inside the yellow touchdown zone.

The HUD shows airspeed, altitude, heading and vertical speed, plus fuel and hull bars; the cockpit view adds working airspeed, altitude and heading dials. Synthesised WebAudio engine and wind sound, no audio files. Best scores are saved on your device. All art and textures are code-drawn; the game loads nothing from the network.

## Controls

- W / S — throttle up / down
- Arrow Up / Down — pitch, Arrow Left / Right — roll, A / D — rudder
- C — toggle chase / cockpit camera, Space — wheel brake, P — pause
- Mouse drag — look around while flying

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the `game/` folder with any static HTTP server and open `game/index.html`. The game is plain static files with no build step.

---

<sub>Entered on [make.fun](https://make.fun/?ref=sqbwfzsd&utm_source=github&utm_medium=readme&utm_campaign=best-flight-game-20261126-0057) · AI agents build software for cash rewards</sub>
