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

## Configuration

In the
[nRF Asset Tracker for AWS](https://github.com/NordicSemiconductor/asset-tracker-cloud-aws-js)
folder, run `node cli web-app-config` and store the output in a local `.envrc`
file. Then run `direnv allow` to allow it.

```bash
# .envrc
export PUBLIC_AVATAR_BUCKET_NAME=...
export PUBLIC_FOTA_BUCKET_NAME=...
export PUBLIC_GEOLOCATION_API_URL=...
export PUBLIC_HISTORICALDATA_TABLE_INFO=...
export PUBLIC_NCELLMEAS_STORAGE_TABLE_NAME=...
export PUBLIC_NEIGHBOR_CELL_GEOLOCATION_API_URL=...
export PUBLIC_USER_IOT_POLICY_ARN=...
export PUBLIC_USER_POOL_CLIENT_ID=...
export PUBLIC_USER_POOL_ID=...
export PUBLIC_WEB_APP_BUCKET_NAME=...
export PUBLIC_REGION=...
export PUBLIC_MQTT_ENDPOINT=...
```

## Running

    npm start

## End-to-end tests using Playwright

The frontend provides [end-to-end tests](./e2e-tests) using
[Playwright](https://playwright.dev/).

You can then run the tests using

    npx playwright test

### Playwright Inspector

For developing tests it is helpful to run the
[Playwright Inspector](https://playwright.dev/docs/inspector).

Then launch the inspector **on your local machine** using

    PWDEBUG=1 npx playwright test

### Running end-to-end tests using GitHub Actions

[This workflow](./.github/workflows/test-and-release.yaml) runs the end-to-end
tests for every commit. For this to work a running instance of
[nRF Asset Tracker for AWS](https://github.com/NordicSemiconductor/asset-tracker-cloud-aws-js)
is needed. The tests will be run agains this instance. Typically it will be the
production instance, to ensure that the web application works with the current
production setup.

In order for the test runner to interact with the instance for retrieving the
app configuration and for providing test data you need to configure AWS
credentials as
[GitHub environment secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment).

Set these secrets:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `WEBAPP_STACK_NAME`

If you have enabled the web application CI you can acquire them using the nRF
Asset Tracker for AWS CLI:

```bash
node cli web-app-ci -s
```

You can set the secrets through the GitHub UI (make sure to create the
`production`
[environment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
in your repository first).

Alternatively you can use the [GitHub CLI](https://cli.github.com/):

```bash
gh secret set AWS_REGION --env production --body "${AWS_REGION}"
gh secret set AWS_ACCESS_KEY_ID --env production --body "${AWS_ACCESS_KEY_ID}"
gh secret set AWS_SECRET_ACCESS_KEY --env production --body "${AWS_SECRET_ACCESS_KEY}"
gh secret set WEBAPP_STACK_NAME --env production --body "${WEBAPP_STACK_NAME}"
```
