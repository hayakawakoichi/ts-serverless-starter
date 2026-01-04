#!/bin/bash
set -e

# Usage: ./scripts/start-issue.sh <issue-number> <branch-name> <worktree-suffix>
# Example: ./scripts/start-issue.sh 3 feat/testing test

ISSUE_NUMBER=$1
BRANCH_NAME=$2
WORKTREE_SUFFIX=$3

if [ -z "$ISSUE_NUMBER" ] || [ -z "$BRANCH_NAME" ] || [ -z "$WORKTREE_SUFFIX" ]; then
  echo "Usage: $0 <issue-number> <branch-name> <worktree-suffix>"
  echo "Example: $0 3 feat/testing test"
  exit 1
fi

REPO_NAME="ts-serverless-starter"
REPO_OWNER="hayakawakoichi"
WORKTREE_DIR="../${REPO_NAME}-${WORKTREE_SUFFIX}"
ISSUE_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/${ISSUE_NUMBER}"

echo "=== Creating worktree for Issue #${ISSUE_NUMBER} ==="

# Check if worktree already exists
if [ -d "$WORKTREE_DIR" ]; then
  echo "Worktree already exists at $WORKTREE_DIR"
  echo "Entering existing worktree..."
else
  # Create worktree
  git worktree add "$WORKTREE_DIR" -b "$BRANCH_NAME" 2>/dev/null || \
    git worktree add "$WORKTREE_DIR" "$BRANCH_NAME"
  echo "Created worktree at $WORKTREE_DIR"
fi

# Change to worktree directory
cd "$WORKTREE_DIR"

# Install dependencies
echo "=== Installing dependencies ==="
pnpm install

# Get issue details from GitHub
echo "=== Fetching issue details ==="
ISSUE_TITLE=$(gh issue view "$ISSUE_NUMBER" --json title -q '.title')
ISSUE_BODY=$(gh issue view "$ISSUE_NUMBER" --json body -q '.body')

# Create prompt for Claude
PROMPT="GitHub Issue #${ISSUE_NUMBER} を実装してください。

## Issue: ${ISSUE_TITLE}
URL: ${ISSUE_URL}

## 詳細:
${ISSUE_BODY}

実装を開始してください。CLAUDE.md の規約に従ってください。"

echo "=== Starting Claude Code ==="
echo "Issue: #${ISSUE_NUMBER} - ${ISSUE_TITLE}"
echo "Worktree: $WORKTREE_DIR"
echo ""

# Run Claude in interactive mode with the prompt
claude -p "$PROMPT" --allowedTools "Bash(pnpm:*),Read,Write,Edit,Glob,Grep,TodoWrite"
