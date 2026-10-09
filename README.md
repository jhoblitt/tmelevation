# tmelevation

[![ci](https://github.com/jhoblitt/tmelevation/actions/workflows/ci.yml/badge.svg)](https://github.com/jhoblitt/tmelevation/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jhoblitt/tmelevation/badge)](https://scorecard.dev/viewer/?uri=github.com/jhoblitt/tmelevation)

TrackMan's 2023 PGA and LPGA Tour Averages tables, reproduced in TrackMan's colours, with every carry, max height and land angle recomputed for the elevation or air pressure you choose. The adjustment comes from a cited golf-ball flight model calibrated to the published sea-level values; the [methods page](https://jhoblitt.github.io/tmelevation/methods.html) documents every equation, assumption and source.

## Install

Nothing to install: the site is <https://jhoblitt.github.io/tmelevation/>.

## Usage

Move the elevation slider, or type an elevation or the air pressure at the course; every recomputed cell shows its change from sea level.

## Development

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/);
commitlint enforces this on every pull request. Every GitHub Action is pinned
to a commit SHA: run `pinact run` after editing a workflow and `actionlint`
before committing it. Where a `Makefile` is present, `make check` is the local gate,
`make tools` installs the pinned linter, and that pin lives in the `Makefile`.

## License

[Apache-2.0](LICENSE)
