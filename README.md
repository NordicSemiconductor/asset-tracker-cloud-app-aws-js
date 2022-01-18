# nRF Asset Tracker Web Application for AWS

[![GitHub Actions](https://github.com/NordicSemiconductor/asset-tracker-cloud-app-aws-js/workflows/Test%20and%20Release/badge.svg)](https://github.com/NordicSemiconductor/asset-tracker-cloud-app-aws-js/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![Mergify Status](https://img.shields.io/endpoint.svg?url=https://gh.mergify.io/badges/NordicSemiconductor/asset-tracker-cloud-app-aws-js)](https://mergify.io)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)
[![React](https://github.com/aleen42/badges/raw/master/src/react.svg)](https://reactjs.org/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5-ffffff?labelColor=7952b3)](https://getbootstrap.com/docs/5.0/)
[![CSS modules](https://img.shields.io/badge/CSS-modules-yellow)](https://github.com/css-modules/css-modules)
[![Vite](https://github.com/aleen42/badges/raw/master/src/vitejs.svg)](https://vitejs.dev/)

The nRF Asset Tracker Web Application for AWS is a reference single-page
application (SPA) developed with [React](https://reactjs.org/) in
[TypeScript](https://www.typescriptlang.org/).

The UI components are themed using
[Bootstrap 5](https://getbootstrap.com/docs/5.0/) and
[CSS modules](https://github.com/css-modules/css-modules). All complex UI logic
is extracted using [React hooks](https://reactjs.org/docs/hooks-custom.html) to
allow re-use when changing the UI framework.

[Vite](https://vitejs.dev/) is used as the frontend toolchain.

> :information_source:
> [Read the complete nRF Asset Tracker documentation](https://nordicsemiconductor.github.io/asset-tracker-cloud-docs/).

## Set up

    npm ci

## Running

    npm start

## End-to-end tests using Playwright

The frontend provides [end-to-end tests](./playwright) using
[Playwright](https://playwright.dev/).

You can then run the tests using

    npx playwright test

### Playwright Inspector

For developing tests it is helpful to run the
[Playwright Inspector](https://playwright.dev/docs/inspector).

Then launch the inspector **on your local machine** using

    PWDEBUG=1 npx playwright test
