# Agent Tweaks 2 validation

## Completed locally

- Pinned dependency installation completed with verification enabled and the existing HTTPS proxy.
- 23 unit/regression tests: catalog/profiles, original values/types, backup-before-write, repeated apply, failed writes, failed read-back/removal, external-change conflicts, invalid/exclusive selections, compatibility skips, serialization, persistent/legacy journals, restart recovery, network failures, and measured benchmark validation.
- Chromium UI smoke checks cover compatible selection, mutually exclusive power plans, filtering, review/cancel, applying through mocked IPC, persistent history, recovery, connection summaries, benchmark validation, and scan-failure lockout.
- JavaScript syntax checks and diff whitespace validation.

## Windows validation pipeline

`.github/workflows/build.yml` runs on main source changes. It must pass before publishing the Windows-validated distribution:

1. Unit tests.
2. Real Windows integration tests: every catalog registry setting applied under an isolated temporary HKCU test subtree, repeated and restored; exact preservation of DWORD/String/ExpandString/Binary/MultiString/QWord originals; PowerShell failure propagation; actual CIM hardware scan; reading and restoring power plan activation.
3. Chromium interface tests.
4. Actual Electron desktop launch, real scanner/preload IPC, and invalid-request rejection.
5. Windows installer/portable build and PE/checksum verification.

A successful run publishes `validation-report.json`, `validation-windows.xml`, checksums, and builds to the `agent-tweaks-v2-release` branch. The report names the exact source commit. Presence of a workflow is not itself proof it passed; inspect that report and the run outcome.

## Limits

Real Windows registry integration confirms storage/rollback behavior, not policy effectiveness on every Windows edition or a particular game's performance. No game FPS, frame-time, click-to-photon latency, or game-server ping benchmarks have been performed on the user's Ryzen/RTX PC. The Linux build host cannot validate Windows hardware or replace those measurements. Signing is unavailable unless a publisher supplies a real certificate. SmartScreen reputation is external to this application.
