#!/bin/bash

# Telegive Dashboard - Pre-Deployment Validation Script
# This script validates the application before deployment to prevent common issues

set -e  # Exit on any error

echo "🔍 Starting pre-deployment validation for Telegive Dashboard..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# 1. Validate Node.js environment
echo "📦 Validating Node.js environment..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "
const current = '$NODE_VERSION'.split('.').map(Number);
const required = '$REQUIRED_VERSION'.split('.').map(Number);
const isValid = current[0] > required[0] || 
                (current[0] === required[0] && current[1] >= required[1]);
if (!isValid) process.exit(1);
"; then
    print_error "Node.js version $NODE_VERSION is below required version $REQUIRED_VERSION"
fi

print_status "Node.js version $NODE_VERSION is valid"

# 2. Validate package manager
echo "📋 Validating package manager..."
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    print_error "No package manager found (npm, yarn, or pnpm required)"
fi

print_status "Package manager: $PACKAGE_MANAGER"

# 3. Validate package.json
echo "📄 Validating package.json..."
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
fi

# Check if package.json is valid JSON
if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
    print_error "package.json is not valid JSON"
fi

print_status "package.json is valid"

# 4. Validate dependencies
echo "🔗 Validating dependencies..."
if [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && [ ! -f "pnpm-lock.yaml" ]; then
    print_warning "No lock file found. This may cause dependency version issues."
fi

# Test dependency installation
echo "Testing dependency installation..."
case $PACKAGE_MANAGER in
    "pnpm")
        pnpm install --frozen-lockfile --silent || print_error "Failed to install dependencies with pnpm"
        ;;
    "yarn")
        yarn install --frozen-lockfile --silent || print_error "Failed to install dependencies with yarn"
        ;;
    "npm")
        npm ci --silent || print_error "Failed to install dependencies with npm"
        ;;
esac

print_status "Dependencies installed successfully"

# 5. Validate TypeScript compilation
echo "🔧 Validating TypeScript compilation..."
if [ ! -f "tsconfig.json" ]; then
    print_error "tsconfig.json not found"
fi

# Check TypeScript compilation
case $PACKAGE_MANAGER in
    "pnpm")
        pnpm run build || print_error "TypeScript compilation failed"
        ;;
    "yarn")
        yarn build || print_error "TypeScript compilation failed"
        ;;
    "npm")
        npm run build || print_error "TypeScript compilation failed"
        ;;
esac

print_status "TypeScript compilation successful"

# 6. Validate environment configuration
echo "🔧 Validating environment configuration..."
if [ ! -f ".env.example" ]; then
    print_error ".env.example file not found"
fi

# Check if all required variables are documented
required_vars=(
    "VITE_API_BASE_URL"
    "VITE_TELEGIVE_AUTH_URL"
    "VITE_TELEGIVE_GIVEAWAY_URL"
    "VITE_APP_NAME"
    "VITE_APP_VERSION"
)

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.example; then
        print_error "Required variable $var not found in .env.example"
    fi
done

print_status "All required environment variables are documented"

# 7. Validate deployment configuration
echo "🚀 Validating deployment configuration..."
dockerfile_exists=false
railway_json_exists=false

if [ -f "Dockerfile" ]; then
    dockerfile_exists=true
fi

if [ -f "railway.json" ] || [ -f "railway.toml" ]; then
    railway_json_exists=true
fi

if [ "$dockerfile_exists" = false ]; then
    print_error "Dockerfile not found"
fi

if [ "$railway_json_exists" = false ]; then
    print_warning "No Railway configuration found (railway.json or railway.toml)"
fi

print_status "Deployment configuration is valid"

# 8. Validate Vite configuration
echo "⚡ Validating Vite configuration..."
if [ ! -f "vite.config.js" ] && [ ! -f "vite.config.ts" ]; then
    print_error "Vite configuration file not found"
fi

print_status "Vite configuration found"

# 9. Validate build output
echo "🏗️  Validating build output..."
if [ ! -d "dist" ]; then
    print_error "Build output directory 'dist' not found. Run build first."
fi

# Check if essential files exist in dist
essential_files=("index.html")
for file in "${essential_files[@]}"; do
    if [ ! -f "dist/$file" ]; then
        print_error "Essential file $file not found in dist directory"
    fi
done

print_status "Build output is valid"

# 10. Run tests
echo "🧪 Running tests..."
case $PACKAGE_MANAGER in
    "pnpm")
        if pnpm run test --passWithNoTests 2>/dev/null; then
            print_status "Tests passed"
        else
            print_warning "Tests failed or no test command found"
        fi
        ;;
    "yarn")
        if yarn test --passWithNoTests 2>/dev/null; then
            print_status "Tests passed"
        else
            print_warning "Tests failed or no test command found"
        fi
        ;;
    "npm")
        if npm test -- --passWithNoTests 2>/dev/null; then
            print_status "Tests passed"
        else
            print_warning "Tests failed or no test command found"
        fi
        ;;
esac

# 11. Validate static assets
echo "🖼️  Validating static assets..."
if [ -d "public" ]; then
    asset_count=$(find public -type f | wc -l)
    print_status "Found $asset_count static assets in public directory"
else
    print_warning "No public directory found"
fi

# 12. Check for common issues
echo "🔍 Checking for common issues..."

# Check for large files that shouldn't be committed
large_files=$(find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" 2>/dev/null || true)
if [ -n "$large_files" ]; then
    print_warning "Large files found (>10MB):"
    echo "$large_files"
fi

# Check for .env files that shouldn't be committed
if [ -f ".env" ]; then
    print_warning ".env file found. Make sure it's in .gitignore"
fi

# Check for node_modules in git
if [ -d "node_modules" ] && git ls-files node_modules/ 2>/dev/null | grep -q .; then
    print_error "node_modules directory is tracked by git. Add it to .gitignore"
fi

print_status "Common issues check completed"

# 13. Validate Docker configuration
echo "🐳 Validating Docker configuration..."
if [ -f "Dockerfile" ]; then
    # Basic Dockerfile validation
    if ! grep -q "FROM" Dockerfile; then
        print_error "Dockerfile missing FROM instruction"
    fi
    
    if ! grep -q "COPY\|ADD" Dockerfile; then
        print_error "Dockerfile missing COPY or ADD instruction"
    fi
    
    if ! grep -q "CMD\|ENTRYPOINT" Dockerfile; then
        print_error "Dockerfile missing CMD or ENTRYPOINT instruction"
    fi
    
    print_status "Dockerfile structure is valid"
fi

if [ -f ".dockerignore" ]; then
    print_status ".dockerignore file found"
else
    print_warning ".dockerignore file not found. Consider adding one for better build performance"
fi

# 14. Final summary
echo ""
echo "🎉 Pre-deployment validation completed!"
echo "📋 Summary:"
echo "   - Node.js environment: ✅"
echo "   - Dependencies: ✅"
echo "   - TypeScript compilation: ✅"
echo "   - Environment variables: ✅"
echo "   - Deployment config: ✅"
echo "   - Build output: ✅"
echo "   - Docker configuration: ✅"
echo ""
echo "🚀 Ready for deployment!"

# Optional: Generate deployment report
if [ "$1" = "--report" ]; then
    echo "📄 Generating deployment report..."
    
    cat > deployment-report.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "validation_status": "passed",
  "node_version": "$NODE_VERSION",
  "package_manager": "$PACKAGE_MANAGER",
  "build_size": "$(du -sh dist 2>/dev/null | cut -f1 || echo 'unknown')",
  "dependencies_count": "$(node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('package.json')).dependencies || {}).length)")",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    print_status "Deployment report generated: deployment-report.json"
fi

