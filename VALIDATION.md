# Agent Tweaks 2 validation

## Completed locally

- Pinned dependency installation completed with verification enabled and the existing HTTPS proxy.
- 31 unit/regression tests: catalog/profiles, original values/types, backup-before-write, repeated apply, failed writes, failed read-back/removal, external-change conflicts, invalid/exclusive selections, compatibility skips, serialization, persistent/legacy journals, restart recovery, network failures, and measured benchmark validation.
- Chromium UI smoke checks cover compatible selection, mutually exclusive power plans, filtering, review/cancel, applying through mocked IPC, persistent history, recovery, connection summaries, benchmark validation, and scan-failure lockout.
- JavaScript syntax checks and diff whitespace validation.

## Windows validation pipeline

`.github/workflows/build.yml` runs on main source changes. It must pass before publishing the Windows-validated distribution:

1. Unit tests.
2. Real Windows integration tests: every catalog registry setting applied under an isolated temporary HKCU test subtree, repeated and restored; exact preservation of DWORD/String/ExpandString/Binary/MultiString/QWord originals; PowerShell failure propagation; actual CIM hardware scan; reading and restoring power plan activation.
3. Chromium interface tests.
4. Actual Electron desktop launch, real scanner/preload IPC, and invalid-request rejection.
5. Windows installer/portable build and PE/checksum verification.

A successful run publishes `validation-report.json`, `validation-windows.xml`, checksums, and builds to GitHub Releases. The report names the exact source commit. Presence of a workflow is not itself proof it passed; inspect that report and the run outcome.

## Limits

Real Windows registry integration confirms storage/rollback behavior, not policy effectiveness on every Windows edition or a particular game's performance. No game FPS, frame-time, click-to-photon latency, or game-server ping benchmarks have been performed on the user's Ryzen/RTX PC. The Linux build host cannot validate Windows hardware or replace those measurements. Signing is unavailable unless a publisher supplies a real certificate. SmartScreen reputation is external to this application.

## Completed Windows acceptance

[Windows validation run](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/actions/runs/37663287472) passed the unit, registry/scanner/power, UI, native Electron, build, packaged startup, installer installation, installed startup, uninstall, signature recording, and distribution verification steps for source `d849d932e3efcbe0a7a49e86fd32c2e2fe3c434d`. Its final repository-file publication failed, so `.github/workflows/publish-release.yml` retrieves the saved validated artifact, verifies its source/acceptance/checksums, and publishes the same files to GitHub Releases. This does not treat the failed overall job as a complete successful run.

The installed-app test caught and led to a fix for Windows short-name path canonicalization in the strict IPC guard. Remote/other files and subframes remain blocked. A fresh recovery directory is created before overriding Electron's storage path.

The verified v2 release is now available at https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/tag/v2.0.0. Its release publishing job passed source/acceptance/hash validation and asset upload. Both executable signatures are recorded as `NotSigned`. Future versions use the normal Windows workflow's explicit release publication; existing release versions are preserved.

## Version 2.0.1

[Windows run 37671554455](https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/actions/runs/37671554455) passed every step, including publication, for source `476521d337f9f64a9fd2ded7005f6801e5059980`. This includes 31 regression tests, real Windows registry/scanner/power checks, the read-only diagnostic helper, UI tests, native startup, packaged startup, installer installation, installed startup, software-rendering startup, uninstall, and distribution verification. The public installer was subsequently downloaded and its SHA-256 matched against the release checksum file.

Both executables remain `NotSigned`. The release improves failure diagnostics and adds optional software rendering; the user's unidentified download/run block has not been reproduced or confirmed fixed. No game-performance gains have been measured. Reports and downloads: https://github.com/DXRKNIGHT67/ChatGPT-Tweaks/releases/tag/v2.0.1.
