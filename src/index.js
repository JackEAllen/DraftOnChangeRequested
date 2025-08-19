// Copyright (c) 2024 Jack Allen
// SPDX - License-Identifier: GPL-3.0-or-later

const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const context = github.context;

        // Validate the event type
        if (context.eventName !== 'pull_request_review') {
            return core.info('Action only runs on PR review events');
        }

        const { review, pull_request: pullRequest } = context.payload;  // Destructure payload for clarity

        if (review.state !== 'changes_requested') {
            return core.info(`Review state is "${review.state}", skipping conversion`);
        }

        if (pullRequest.draft) {
            return core.info('Pull request is already a draft, skipping conversion');
        }

        // Retrieve and check GitHub Token
        const token = core.getInput('github-token');
        if (!token) {
            return core.setFailed('A GitHub token is required with the pull_requests:write permission');
        }

        core.setSecret(token);
        const octokit = github.getOctokit(token);

        // Retrieve PR details and try to convert to draft
        try { 
            const prData = await octokit.rest.pulls.get({
                owner: context.repo.owner,
                repo: context.repo.repo,
                pull_number: pullRequest.number
            });

            await convertToDraft(octokit, prData.data, pullRequest.number);
        } catch (fetchError) {
            if (fetchError.status === 404) {
                return core.setFailed('The repository or pull request was not found - Please check token permissions and repository access');
            }
            throw fetchError;
        }

    } catch (error) {
        const safeError = error.message?.replace(/token|auth|secret/gi, '[REDACTED]');
        core.setFailed(`Action failed: ${safeError}`);
    }
}

async function convertToDraft(octokit, currentPR, prNumber) {
    const mutation = `
        mutation ConvertPullRequestToDraft($pullRequestId: ID!) {
            convertPullRequestToDraft(input: {pullRequestId: $pullRequestId}) {
                pullRequest {
                    isDraft
                    number
                }
            }
        }`;

        // Execute the GraphQL mutation to convert the PR to draft
        try {
            const response = await octokit.graphql(mutation, {
                pullRequestId: currentPR.node_id  // node_id for the PR
            });

            response.convertPullRequestToDraft.pullRequest.isDraft
                ? core.info(`Pull request #${prNumber} successfully converted to draft`)
                : core.setFailed(`Failed to convert pull request #${prNumber} to draft`);
        } catch (error) {
            const errorMessages = {
                'convertPullRequestToDraft\' doesn\'t seem to exist': 'The GraphQL mutation is not available - Possibly due to repository or token limitations',
                ' PR was submitted from a fork': 'Converting from a fork is not supported'
            };
            // Check for known error messages and handle them accordingly
            const knownError = Object.entries(errorMessages)
                .find(([key]) => error.message?.includes(key))?.[1];

            if (knownError) {
                core.setFailed(`Conversion failed: ${knownError}`);
            } else if (error.status === 403) {
                core.setFailed('Insufficient permissions to convert PR to draft - Ensure the token has the correct scope and the repository allows this action');
            } else if (error.status === 404) {
                core.setFailed('Pull request not found - Check if the PR number is correct and the repository exists and is accessible');
            } else {
                const safeError = error.message?.replace(/token|auth|secret/gi, '[REDACTED]');
                core.setFailed(`Conversion failed: ${safeError}`);
            }
        }
}

run();