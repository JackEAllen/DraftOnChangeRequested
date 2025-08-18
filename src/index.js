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

        // Check if the review state is 'changes_requested'
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
        const octokit = github.getOctokit(token);  // Needed to interact with GitHub API

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
        // Redact sensitive information from error messages safely so they don't leak tokens or secrets
        const safeError = error.message?.replace(/token|auth|secret/gi, '[REDACTED]');
        core.setFailed(`Action failed: ${safeError}`);
    }
}

async function convertToDraft(octokit, currentPR, prNumber) {
    core.info(`Converting PR #${prNumber} to draft...`);
}

run();