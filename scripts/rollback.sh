#!/bin/bash

# Telegive Dashboard - Emergency Rollback Script
# This script performs an emergency rollback to a previous working version

set -e  # Exit on any error

BACKUP_COMMIT=$1
SERVICE_URL=${2:-""}
FORCE=${3:-false}

if [ -z "$BACKUP_COMMIT" ]; then
    echo "Usage: $0 <backup-commit-hash> [service-url] [force]"
    echo "Example: $0 abc123def https://telegive-dashboard.railway.app false"
    echo ""
    echo "Parameters:"
    echo "  backup-commit-hash: Git commit hash to rollback to"
    echo "  service-url: URL to test after rollback (optional)"
    echo "  force: Skip confirmation prompts (optional, default: false)"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "================================"
echo "Target commit: $BACKUP_COMMIT"
echo "Service URL: ${SERVICE_URL:-"Not provided"}"
echo "Force mode: $FORCE"
echo ""

# 1. Validate git repository
print_info "Validating git repository..."
if [ ! -d ".git" ]; then
    print_error "Not a git repository. Run this script from the project root."
fi

# Check if we're on the main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
    print_warning "Not on main/master branch. Current branch: $current_branch"
    
    if [ "$FORCE" != "true" ]; then
        read -p "Continue with rollback on branch '$current_branch'? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Rollback cancelled."
            exit 1
        fi
    fi
fi

# 2. Validate backup commit
print_info "Validating backup commit..."
if ! git cat-file -e "$BACKUP_COMMIT" 2>/dev/null; then
    print_error "Commit $BACKUP_COMMIT does not exist"
fi

# Get commit details
commit_message=$(git log --format="%s" -n 1 "$BACKUP_COMMIT")
commit_date=$(git log --format="%ci" -n 1 "$BACKUP_COMMIT")
commit_author=$(git log --format="%an" -n 1 "$BACKUP_COMMIT")

print_info "Rollback target details:"
echo "  Commit: $BACKUP_COMMIT"
echo "  Message: $commit_message"
echo "  Date: $commit_date"
echo "  Author: $commit_author"
echo ""

# 3. Confirmation
if [ "$FORCE" != "true" ]; then
    print_warning "This will force push to the remote repository and trigger a redeployment."
    print_warning "This action cannot be easily undone."
    echo ""
    read -p "Are you sure you want to proceed with the rollback? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rollback cancelled."
        exit 1
    fi
fi

# 4. Save current state for potential recovery
print_info "Saving current state for recovery..."
current_commit=$(git rev-parse HEAD)
recovery_branch="recovery-$(date +%Y%m%d-%H%M%S)-$current_commit"

git branch "$recovery_branch" HEAD
print_status "Recovery branch created: $recovery_branch"
echo "  To restore current state later: git checkout $recovery_branch"

# 5. Perform rollback
print_info "Performing rollback to $BACKUP_COMMIT..."

# Checkout the backup commit
git checkout "$BACKUP_COMMIT"

# Create a new commit to make the rollback explicit
git checkout -b "rollback-$(date +%Y%m%d-%H%M%S)"
git add -A
git commit -m "Emergency rollback to $BACKUP_COMMIT

Original commit: $current_commit
Rollback reason: Emergency deployment recovery
Rollback time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Recovery branch: $recovery_branch

Previous commit details:
- Hash: $BACKUP_COMMIT
- Message: $commit_message
- Date: $commit_date
- Author: $commit_author" || echo "No changes to commit"

# Switch back to main branch and reset
git checkout "$current_branch"
git reset --hard "$BACKUP_COMMIT"

print_status "Local rollback completed"

# 6. Push to remote
print_info "Pushing rollback to remote repository..."

if [ "$FORCE" = "true" ]; then
    git push --force-with-lease origin "$current_branch"
else
    print_warning "About to force push to origin/$current_branch"
    read -p "Continue with force push? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push --force-with-lease origin "$current_branch"
    else
        print_error "Rollback cancelled. Local changes have been made but not pushed."
    fi
fi

print_status "Rollback pushed to remote repository"

# 7. Wait for deployment
print_info "Waiting for deployment to complete..."
echo "This may take 2-5 minutes depending on the deployment platform..."

# Wait periods: 30s, 60s, 90s, 120s
wait_periods=(30 60 90 120)
for period in "${wait_periods[@]}"; do
    print_info "Waiting ${period} seconds for deployment..."
    sleep "$period"
    
    if [ -n "$SERVICE_URL" ]; then
        print_info "Testing service availability..."
        if curl -f -s "$SERVICE_URL" > /dev/null 2>&1; then
            print_status "Service is responding after ${period}s"
            break
        else
            print_warning "Service not yet responding after ${period}s"
        fi
    fi
done

# 8. Verify rollback
if [ -n "$SERVICE_URL" ]; then
    print_info "Verifying rollback deployment..."
    
    # Test basic connectivity
    if curl -f -s "$SERVICE_URL" > /dev/null; then
        print_status "Basic connectivity test passed"
    else
        print_error "Basic connectivity test failed"
    fi
    
    # Test health endpoint if available
    health_endpoints=("/health" "/api/health" "/health/live")
    health_found=false
    
    for endpoint in "${health_endpoints[@]}"; do
        if curl -f -s "$SERVICE_URL$endpoint" > /dev/null 2>&1; then
            print_status "Health endpoint accessible: $endpoint"
            health_found=true
            break
        fi
    done
    
    if [ "$health_found" = false ]; then
        print_warning "No health endpoint found (may be expected)"
    fi
    
    # Test response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$SERVICE_URL")
    response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$response_time_ms" -lt 5000 ]; then
        print_status "Response time: ${response_time_ms}ms (good)"
    else
        print_warning "Response time: ${response_time_ms}ms (slow)"
    fi
    
else
    print_warning "No service URL provided. Manual verification required."
fi

# 9. Generate rollback report
print_info "Generating rollback report..."

cat > rollback-report.json << EOF
{
  "rollback": {
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "from_commit": "$current_commit",
    "to_commit": "$BACKUP_COMMIT",
    "branch": "$current_branch",
    "recovery_branch": "$recovery_branch",
    "service_url": "${SERVICE_URL:-"not_provided"}",
    "verification": {
      "connectivity": "$([ -n "$SERVICE_URL" ] && curl -f -s "$SERVICE_URL" > /dev/null && echo "passed" || echo "not_tested")",
      "health_check": "$([ "$health_found" = true ] && echo "passed" || echo "not_found")",
      "response_time_ms": "${response_time_ms:-"not_measured"}"
    },
    "target_commit_details": {
      "hash": "$BACKUP_COMMIT",
      "message": "$commit_message",
      "date": "$commit_date",
      "author": "$commit_author"
    }
  }
}
EOF

print_status "Rollback report generated: rollback-report.json"

# 10. Final summary and next steps
echo ""
echo "🎉 EMERGENCY ROLLBACK COMPLETED"
echo "==============================="
echo ""
print_status "Rollback Summary:"
echo "  - Rolled back from: $current_commit"
echo "  - Rolled back to: $BACKUP_COMMIT"
echo "  - Recovery branch: $recovery_branch"
echo "  - Service URL: ${SERVICE_URL:-"Not provided"}"
echo "  - Verification: $([ -n "$SERVICE_URL" ] && echo "Completed" || echo "Manual required")"
echo ""

print_info "Next Steps:"
echo "  1. Monitor the service for stability"
echo "  2. Investigate the root cause of the issue"
echo "  3. Fix the issue in a new branch"
echo "  4. Test thoroughly before redeploying"
echo ""

print_info "Recovery Options:"
echo "  - To restore the previous state: git checkout $recovery_branch"
echo "  - To see rollback details: cat rollback-report.json"
echo "  - To view commit history: git log --oneline -10"
echo ""

# Optional: Send notification
if [ -n "$WEBHOOK_URL" ]; then
    print_info "Sending rollback notification..."
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"🚨 Emergency rollback completed for Telegive Dashboard\",
            \"from_commit\": \"$current_commit\",
            \"to_commit\": \"$BACKUP_COMMIT\",
            \"service_url\": \"${SERVICE_URL:-"not_provided"}\",
            \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"
        }" > /dev/null 2>&1 || print_warning "Failed to send notification"
fi

print_status "Emergency rollback procedure completed successfully!"

# Exit with appropriate code
if [ -n "$SERVICE_URL" ]; then
    # Exit with error if service is not responding
    if ! curl -f -s "$SERVICE_URL" > /dev/null; then
        print_error "Service verification failed. Manual intervention required."
    fi
fi

echo "✨ Rollback completed successfully!"

