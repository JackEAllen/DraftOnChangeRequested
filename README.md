# DraftOnChangeRequested

A GitHub Action to convert a PR to a draft PR if the review state changes to `changes_requested`

## Usage

### Setup 

Create a workflow in your repository at `.github/workflows/convert_to_draft.yml`:

```yaml
name: Convert to Draft on Change Request

on:
  pull_request_review:
    types: [submitted]

jobs:
  convert-to-draft:
    if: github.event.review.state == 'changes_requested'
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - name: Convert PR to Draft
        uses: JackEAllen/DraftOnChangeRequested@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- If using from marketplace, the above template will work as is.
- If using from a local path if cloned, replace `JackEAllen` with `./` (the local path to the action)

### Require permissions

For this action to work, you will need the followihng permissions:

- A GitHub token with:
  - `pull-requests: write` to update the pull request
  - `contents: read` to access the repository contents

## Repository Settings

### For Public Repositories

- No additional setup should be required

### For Private Repositories

- Ensure that the `Allow GitHub Actions to create and approve pull requests` is enabled in the repository settings under `Actions` > `General` > `Workflow permissions`.

## Limitations

- Can't convert a PR submitted from forks
- Requires the PR to be in the `open` state (not a draft)
- Only triggered on `pull_request_review` events with the state `changes_requested` sent by a reviewer.

## How it works

1. Listens for a pull request review event
2. Checks if the review state has changed to `changes_requested`
3. Converts the pull request to a draft if it is not already a draft
4. Skips the action if the conditions are not met

## Development

If you want to build this action from source you can:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Make your changes
4. Run `npm run build` to build the action
5. Create a wortkflow file in `.github/workflows/` for the action
    - Example: `.github/workflows/integration_test.yml`:

    ```yaml
    - name: Convert PR to Draft on Changes Requested
      uses: ./  # Use the local path to the action
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
    ```

## Pre-requisites

In order to run this action, you need to have the following:

- Node.js 24+
- npm

## License

This project is licensed under GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
