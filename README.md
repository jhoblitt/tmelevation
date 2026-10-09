# tmelevation

[![ci](https://github.com/jhoblitt/tmelevation/actions/workflows/ci.yml/badge.svg)](https://github.com/jhoblitt/tmelevation/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/jhoblitt/tmelevation/badge)](https://scorecard.dev/viewer/?uri=github.com/jhoblitt/tmelevation)

<https://jhoblitt.github.io/tmelevation/> shows TrackMan's 2023 PGA and LPGA Tour Averages tables, reproduced in TrackMan's colours, with every carry, max height and land angle recomputed for the elevation or air pressure you choose. The adjustment comes from a cited golf-ball flight model calibrated to the published sea-level values; the [methods page](https://jhoblitt.github.io/tmelevation/methods.html) documents every equation, assumption and source.

## Install

Nothing to install: the site is <https://jhoblitt.github.io/tmelevation/>.

## Usage

Move the elevation slider, or type an elevation or the air pressure at the course; every recomputed cell shows its change from sea level.

## Data

The tour-average figures are TrackMan's 2023 PGA and LPGA Tour Averages, published in [“Introducing updated tour averages”](https://www.trackman.com/blog/introducing-updated-tour-averages) and reproduced here with attribution (`site/js/data.js`). They are not covered by this repository's Apache-2.0 licence.

## Method

The [methods page](https://jhoblitt.github.io/tmelevation/methods.html) states every equation, constant, assumption, limitation and source. In short: elevation sets the air pressure through the U.S. Standard Atmosphere 1976, and the air is taken as dry and at 25 °C, so its density scales with pressure alone. Each shot is flown by a two-dimensional point-mass model with backspin, using Smits & Smith's (1994) drag, lift and spin-decay terms and integrated by fourth-order Runge–Kutta; per table row, its drag and lift are scaled so that at sea level it reproduces that row's published carry and max height. A displayed value is the published value plus the modelled change at the chosen density; launch conditions stay as published, and the land-angle column is indicative.

## Fonts

The pages use Oswald and Lato, both under the SIL Open Font License 1.1. The unmodified font files, their licence texts and their sources are in `site/fonts/`.

## Accessibility

The tables reproduce TrackMan's palette exactly, so their white text has TrackMan's contrast: 3.18:1 on the orange rows and 2.26:1 on the striped rows, below WCAG AA. Everything this site adds — the change lines, the methods link, focus rings and hints — meets AA.

## Development

The site is plain ES modules under `site/` and has no dependencies; Node is the version in `.nvmrc`.

- `npm test` runs the unit tests, including every hard reference oracle.
- `npm run oracles` prints every reference oracle's result; only a hard oracle fails it.
- `npm run test:browser` builds two release artifacts and smoke-tests each, then runs the end-to-end tests against `site/`, all in headless Google Chrome (`google-chrome`, or the binary named by `CHROME_BIN`; set `CHROME_NO_SANDBOX=1` where Chrome cannot start sandboxed).

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/);
commitlint enforces this on every pull request. Every GitHub Action is pinned
to a commit SHA: run `pinact run` after editing a workflow and `actionlint`
before committing it. Where a `Makefile` is present, `make check` is the local gate,
`make tools` installs the pinned linter, and that pin lives in the `Makefile`.

## Releases

Every merge to `main` runs the tests and then semantic-release, which reads the Conventional Commits since the last release: `feat` cuts a minor release; `fix`, `docs`, `refactor`, `perf` and `revert` a patch; a breaking change a major; `chore`, `ci`, `test`, `build` and `style` none. A release pushes a `vX.Y.Z` tag, publishes its notes as a GitHub Release, and deploys that tag to GitHub Pages. A tag pushed by hand deploys only if it is on `main` and the highest release there.

To redeploy a release, or roll the site back to an older one, run the `deploy` workflow by hand with its tag:

```sh
gh workflow run deploy.yml -f tag=v1.2.3
```

The next release deploys over a rollback.

## License

[Apache-2.0](LICENSE)
