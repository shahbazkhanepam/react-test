const { execSync } = require('child_process');
const { writeFileSync, unlinkSync } = require('fs');

const claudeApiKey = process.env.CLAUDE_API_KEY; // Set your Claude API key as an environment variable
const repo = 'shahbazkhanepam/react-test'; // <-- Replace with your repo, e.g., 'myuser/myrepo'
const branchName = process.argv[2]; // Branch name from command line

if (!branchName) {
  console.error('Usage: node review-pr-by-branch.js <BRANCH_NAME>');
  process.exit(1);
}

// Step 1: Find PR number for the branch
let prNumber;
try {
  const prs = JSON.parse(execSync(`gh pr list --repo ${repo} --state open --json number,headRefName`).toString());
  const pr = prs.find(p => p.headRefName === branchName);
  if (!pr) {
    console.error(`No open PR found for branch "${branchName}"`);
    process.exit(1);
  }
  prNumber = pr.number;
} catch (err) {
  console.error('Error fetching PR list:', err);
  process.exit(1);
}

// Step 2: Fetch PR title and description
let title, description;
try {
  const prInfo = JSON.parse(execSync(`gh pr view ${prNumber} --repo ${repo} --json title,body`).toString());
  title = prInfo.title;
  description = prInfo.body;
} catch (err) {
  console.error('Error fetching PR info:', err);
  process.exit(1);
}

// Step 3: Fetch diff between branch and main
let diff;
try {
  diff = execSync(`git fetch origin ${branchName} && git diff origin/main...origin/${branchName}`).toString();
  if (!diff.trim()) {
    console.error('No diff found between main and branch.');
    process.exit(1);
  }
} catch (err) {
  console.error('Error fetching diff:', err);
  process.exit(1);
}

// Step 4: Build prompt for Claude
const prompt = `
You are a senior frontend engineer acting as a PR Review Agent. Review the following code changes for best practices, code quality, and potential bugs. Provide actionable feedback in bullet points.

PR Title: ${title}
PR Description: ${description}
Code Diff:
${diff}
`;

// Step 5: Send prompt to Claude API
fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': claudeApiKey,
    'Content-Type': 'application/json',
    'Anthropic-Version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024
  })
})
  .then(res => res.json())
  .then(data => {
    // Extract the review text from the response
    const reviewText = data.content[0].text;
    const aiReview = `### Reviewed by AI 🤖\n\n${reviewText}`;
    writeFileSync('ai_review.txt', aiReview);
    execSync(`gh pr comment ${prNumber} --repo ${repo} --body-file ai_review.txt`);
    unlinkSync('ai_review.txt');
    // execSync(`gh pr comment ${prNumber} --repo ${repo} --body "${aiReview.replace(/"/g, '\\"')}"`);
    console.log('\n=== Review posted to PR! ===\n');
  })
  .catch(err => console.error('Error:', err));