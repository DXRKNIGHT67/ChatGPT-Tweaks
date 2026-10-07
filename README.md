# Agent Tweaks — Your path for glory

A Windows desktop performance toolkit with a black-and-blue command center, your actual hardware, a 68-option tweak library, and verified recovery. Version 2 replaces the original engine rather than just changing the interface.

## Validated Windows downloads

The Windows-tested 2.0.0 build is published to GitHub Releases:

- [Windows installer](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/download/v2.0.0/Agent-Tweaks-2.0.0-x64-Setup.exe)
- [Portable Windows app](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/download/v2.0.0/Agent-Tweaks-2.0.0-x64-Portable.exe)
- [Source pack](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/raw/refs/heads/main/downloads/Agent-Tweaks-2.0.0-Source.zip)
- [Validation and signing report](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/download/v2.0.0/validation-report.json)
- [Windows test results](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/download/v2.0.0/validation-windows.xml)

Links are available only after a successful publishing job. Unsigned builds can still display browser/SmartScreen warnings. Check the report's signing status; no security protection should be disabled.

## What improved

- **Hardware-aware profiles:** scans CPU/threads, GPU names/drivers, physical RAM, disk usage, Windows build, network adapters, installed Edge/Office and available power plans. Unsupported settings are disabled. Ryzen and NVIDIA rigs receive targeted guidance.
- **68 reversible options:** gaming/capture controls, desktop preferences, background browser policies, Windows suggestion debloat, privacy choices, and Balanced/High performance power plans. These categories have different effects; privacy preferences are not advertised as FPS boosts.
- **Performance mode:** selects applicable gaming/background options and Balanced power for modern Ryzen desktops. High performance remains an optional desktop benchmark candidate, not a universal recommendation.
- **A durable recovery journal:** saves original value and type before writes, verifies writes and restores, preserves failed operations for recovery, imports v1 backups, and detects external changes instead of overwriting newer user choices.
- **Actual state:** applied-write counts, pending recovery records, and persistent per-setting operation history are separate.
- **Live local telemetry:** CPU and RAM use. No invented GPU load or optimization score.
- **Connection lab:** five TCP probes, median/range/spread and failed connections, clearly distinguished from game ping and packet loss.
- **Benchmark journal:** compares FPS and 1% low measurements entered from your game's benchmark. Results are not fabricated or measured by the app itself.
- **Protected desktop:** sandboxed renderer, strict IPC origin checks, allowlisted settings/actions, single-instance mutation lock, pinned Electron and dependencies, and no antivirus/security bypasses.

## Development and builds

Windows 10/11 x64 and Windows PowerShell are required to apply optimizations. Node.js 22+ is needed only for development.

```sh
npm ci
npm test
npm run test:ui
npm run test:windows  # actual Windows only
node tests/electron.integration.cjs  # actual desktop startup on Windows
npm start
npm run build:win
```

`npm run build:portable` builds a portable Windows executable from Linux without Wine. `dist/` contains generated executables. Linux displays real CPU/RAM in an explicitly labeled preview; it cannot apply Windows settings. Linux UI tests use `/usr/bin/chromium` by default; override `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` where needed. On Windows install the test browser with `npx playwright install chromium`.

The GitHub Actions workflow runs unit/UI tests, real Windows scan and sandboxed-registry roundtrips, actual Electron startup, builds, and packaged-app installation/launch/uninstall acceptance. Only successful jobs publish their distribution and validation report to GitHub Releases. Registry integration tests map every registry option to an isolated temporary test subtree rather than altering the runner's normal settings. Power tests restore the original active plan.

## Use

Scan your PC → select Recommended or Performance mode → review → apply. No changes happen just by opening the app. Select all selects compatible settings and only one power plan; read feature tradeoffs. Restart the game or sign out when needed. Recovery restores original values and reports conflicts rather than replacing external changes. Export diagnostics locally if you want a readable record.

Backups remain under `%APPDATA%\agent-tweaks\recovery-v2.json`. Existing v1 backup files in `%APPDATA%\agent-tweaks` or `%APPDATA%\Agent Tweaks` are supported. Keep recovery files until all originals are restored. Empty created registry keys can remain after removing a value. Do not manually modify journals. Benchmark entries stay in local renderer storage. A requested network test contacts Cloudflare `1.1.1.1:443`. Hardware data is not uploaded.

## Performance and trust

For Ryzen 5 8400F / RTX 5060 Ti / 32 GB, retain a system-managed page file, use current AMD chipset/NVIDIA drivers, test in-game Reflex/DLSS, verify refresh rate, and watch VRAM consumption in your game. WMI GPU memory is unreliable, so the scanner does not claim an exact VRAM amount. Policies vary by Windows edition/application management status; a verified registry value does not prove the OS honors every policy.

No registry pack can guarantee large FPS gains or remove routing/server latency. Compare repeated, identical game scenes and 1% lows. Defender, updates, core services, interrupt routing, HPET, forced timers, and security mitigations are left alone.

SmartScreen/browser reputation warnings cannot be eliminated with app code. Public releases need a real publisher code-signing certificate and reputation. The workflow can use optional `WINDOWS_CERTIFICATE` and `WINDOWS_CERTIFICATE_PASSWORD` repository secrets for signing; without them it produces an unsigned build and records that fact. It does not claim signing occurred or ask you to disable protection.

See [VALIDATION.md](VALIDATION.md) for current evidence. Preview screenshots use explicit test hardware fixtures and are design examples, not a scan of the build host.
