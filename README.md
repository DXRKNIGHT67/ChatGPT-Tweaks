# Agent Tweaks — Your path for glory

A black-and-blue Windows desktop optimizer with a local hardware scan, 60 opt-in registry settings, recommended profiles, review-before-apply, per-setting results, and original-value recovery.

## Download

[Download Agent Tweaks for Windows x64](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/raw/refs/heads/main/downloads/Agent-Tweaks-1.0.0.exe) · [Download source pack](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/raw/refs/heads/main/downloads/Agent-Tweaks-Source.zip)

The portable executable is unsigned and does not require an installer. Windows registry apply/restore and scanner integration still require Windows testing; see VALIDATION.md. Download and run it on Windows, not inside this chat.

## Build

Requires Windows 10 or 11 x64 for hardware scanning and applying settings. Node.js 22+ is required only for development.

```sh
npm ci
npm test
npm start
npm run build:win
```

The downloadable installer is produced in `dist/` on Windows. `npm run build:portable` produces a portable Windows executable on Linux without Wine. Install it and launch **Agent Tweaks**. Scan your PC, choose Recommended or Performance mode, review each selected change, and apply. Sign out or restart afterward. Recovery restores original registry values. No administrator rights are required for the included per-user tweaks.

The Windows installer is unsigned. Public distribution should follow testing on supported Windows versions and code signing by the publisher. Hardware scanning needs Windows PowerShell, CIM, and the NetAdapter module. Non-Windows systems display their real CPU/RAM with explicit preview labels and cannot apply changes.

## What it does

- Detects CPU, GPU name/driver, physical RAM, disks/free space, OS/build, chassis type, active adapters, and CPU/RAM usage.
- 60 settings covering capture, mouse acceleration, desktop visual effects, suggestions, optional browser background features, and privacy.
- Select all, category/search filtering, Recommended, and a desktop-aware Performance profile.
- Writes only current-user registry values. Saves the first original value and type before writing, reads back each applied value, and reports individual failures.
- Network TCP connection measurement with a clearly named endpoint. Not a game ping or FPS benchmark.
- Links to Windows graphics, network, app uninstall, and startup settings.

`dashboard-preview.png` is an interface screenshot using simulated hardware supplied in the request; the shipped app scans the actual machine.

## Scope and limitations

This is a first release. The catalog and UI can be validated on Linux; real registry apply/restore and hardware scanning require Windows validation. The GPU scan does not claim VRAM capacity (WMI memory reporting can be wrong on modern GPUs). No fake hardware or performance score is displayed. Your Ryzen 5 8400F / RTX 5060 Ti / 32 GB machine will be scanned rather than hardcoded for everyone.

Policies vary by Windows build/edition and installed software. A registry read-back verifies the write, not that Windows honors every policy. No FPS or ping gain is guaranteed. Suggested-content settings are lightweight debloat; the app does not bulk uninstall apps or disable core services. Defender, updates, networking services, page files, HPET, timer resolution, IRQ configuration, and security mitigations are not changed.

Backups live in Electron's user-data directory (`%APPDATA%/Agent Tweaks` or `%APPDATA%/agent-tweaks`, depending on packaging), in `registry-backup.json`. Keep this file until restoration. A backed-up setting can include a failed write; restoration is intentionally offered for it. Avoid manually editing that file. Registry keys created by the app may remain empty after restore. The app neither collects nor uploads hardware information; the connection test contacts Cloudflare 1.1.1.1:443 only when requested.

For latency, favor Ethernet, avoid saturated uploads/downloads, select a nearby game server, and use NVIDIA Reflex in supported games. DNS/registry settings cannot eliminate internet routing delay. Benchmark average FPS and 1% lows before/after with the same game scene.
