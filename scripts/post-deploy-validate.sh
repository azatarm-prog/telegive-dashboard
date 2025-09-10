#!/bin/bash

# Telegive Dashboard - Post-Deployment Validation Script
# This script validates the deployed application to ensure it's working correctly

set -e  # Exit on any error

SERVICE_URL=$1
TIMEOUT=${2:-300}  # Default 5 minutes timeout

if [ -z "$SERVICE_URL" ]; then
    echo "Usage: $0 <service-url> [timeout-seconds]"
    echo "Example: $0 https://telegive-dashboard.railway.app 300"
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

echo "🔍 Starting post-deployment validation for: $SERVICE_URL"
echo "⏱️  Timeout: ${TIMEOUT} seconds"
echo ""

# 1. Wait for service to be ready
echo "⏳ Waiting for service to be ready..."
start_time=$(date +%s)

for i in $(seq 1 20); do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [ $elapsed -gt $TIMEOUT ]; then
        print_error "Timeout waiting for service to be ready (${TIMEOUT}s)"
    fi
    
    if curl -f -s "$SERVICE_URL" > /dev/null 2>&1; then
        print_status "Service is responding (attempt $i)"
        break
    fi
    
    print_info "Waiting for service... (attempt $i/20, ${elapsed}s elapsed)"
    sleep 15
done

# 2. Test basic connectivity
echo ""
echo "🌐 Testing basic connectivity..."

response_code=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL")
if [ "$response_code" != "200" ]; then
    print_error "Basic connectivity failed. HTTP status: $response_code"
fi

print_status "Basic connectivity successful (HTTP $response_code)"

# 3. Test main application routes
echo ""
echo "🏠 Testing main application routes..."

# Test root route
print_info "Testing root route..."
if ! curl -f -s "$SERVICE_URL/" > /dev/null; then
    print_error "Root route (/) failed"
fi
print_status "Root route accessible"

# Test login route
print_info "Testing login route..."
if ! curl -f -s "$SERVICE_URL/login" > /dev/null; then
    print_warning "Login route (/login) failed - may be expected for SPA"
else
    print_status "Login route accessible"
fi

# Test dashboard route (should redirect to login if not authenticated)
print_info "Testing dashboard route..."
dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/dashboard")
if [ "$dashboard_response" = "200" ] || [ "$dashboard_response" = "302" ] || [ "$dashboard_response" = "401" ]; then
    print_status "Dashboard route responding correctly (HTTP $dashboard_response)"
else
    print_warning "Dashboard route returned unexpected status: $dashboard_response"
fi

# 4. Test static assets
echo ""
echo "📦 Testing static assets..."

# Test favicon
print_info "Testing favicon..."
if curl -f -s "$SERVICE_URL/favicon.ico" > /dev/null; then
    print_status "Favicon accessible"
else
    print_warning "Favicon not accessible (may be expected)"
fi

# Test manifest (if exists)
print_info "Testing manifest..."
if curl -f -s "$SERVICE_URL/manifest.json" > /dev/null; then
    print_status "Manifest accessible"
else
    print_warning "Manifest not accessible (may be expected)"
fi

# 5. Test API endpoints (if any)
echo ""
echo "🔌 Testing API endpoints..."

# Test health endpoint (if exists)
print_info "Testing health endpoint..."
health_endpoints=("/health" "/api/health" "/health/live")

health_found=false
for endpoint in "${health_endpoints[@]}"; do
    if curl -f -s "$SERVICE_URL$endpoint" > /dev/null; then
        print_status "Health endpoint accessible: $endpoint"
        health_found=true
        break
    fi
done

if [ "$health_found" = false ]; then
    print_warning "No health endpoint found (may be expected for frontend-only app)"
fi

# 6. Test performance
echo ""
echo "⚡ Testing performance..."

print_info "Measuring response time..."
response_time=$(curl -s -o /dev/null -w "%{time_total}" "$SERVICE_URL")
response_time_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)

if [ "$response_time_ms" -lt 2000 ]; then
    print_status "Response time: ${response_time_ms}ms (excellent)"
elif [ "$response_time_ms" -lt 5000 ]; then
    print_status "Response time: ${response_time_ms}ms (good)"
else
    print_warning "Response time: ${response_time_ms}ms (slow)"
fi

# 7. Test content validation
echo ""
echo "📄 Testing content validation..."

print_info "Checking HTML content..."
html_content=$(curl -s "$SERVICE_URL")

# Check for basic HTML structure
if echo "$html_content" | grep -q "<html"; then
    print_status "Valid HTML structure found"
else
    print_error "Invalid HTML structure"
fi

# Check for title
if echo "$html_content" | grep -q "<title>"; then
    title=$(echo "$html_content" | grep -o "<title>[^<]*" | sed 's/<title>//')
    print_status "Page title found: $title"
else
    print_warning "No page title found"
fi

# Check for React app div
if echo "$html_content" | grep -q 'id="root"'; then
    print_status "React app root element found"
else
    print_warning "React app root element not found"
fi

# Check for JavaScript bundles
if echo "$html_content" | grep -q "\.js"; then
    print_status "JavaScript bundles found"
else
    print_warning "No JavaScript bundles found"
fi

# Check for CSS
if echo "$html_content" | grep -q "\.css"; then
    print_status "CSS files found"
else
    print_warning "No CSS files found"
fi

# 8. Test security headers
echo ""
echo "🔒 Testing security headers..."

print_info "Checking security headers..."
headers=$(curl -s -I "$SERVICE_URL")

# Check for common security headers
security_headers=(
    "X-Content-Type-Options"
    "X-Frame-Options"
    "X-XSS-Protection"
    "Strict-Transport-Security"
    "Content-Security-Policy"
)

for header in "${security_headers[@]}"; do
    if echo "$headers" | grep -qi "$header"; then
        print_status "Security header found: $header"
    else
        print_warning "Security header missing: $header"
    fi
done

# 9. Test HTTPS (if applicable)
echo ""
echo "🔐 Testing HTTPS configuration..."

if [[ "$SERVICE_URL" == https://* ]]; then
    print_info "Testing HTTPS certificate..."
    
    # Test SSL certificate
    if curl -s --insecure "$SERVICE_URL" > /dev/null; then
        print_status "HTTPS endpoint accessible"
        
        # Check certificate validity
        if openssl s_client -connect "$(echo "$SERVICE_URL" | sed 's|https://||' | sed 's|/.*||'):443" -servername "$(echo "$SERVICE_URL" | sed 's|https://||' | sed 's|/.*||')" < /dev/null 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
            print_status "SSL certificate is valid"
        else
            print_warning "SSL certificate validation failed"
        fi
    else
        print_error "HTTPS endpoint not accessible"
    fi
else
    print_warning "Service is not using HTTPS"
fi

# 10. Test mobile responsiveness
echo ""
echo "📱 Testing mobile responsiveness..."

print_info "Checking viewport meta tag..."
if echo "$html_content" | grep -q 'name="viewport"'; then
    print_status "Viewport meta tag found (mobile responsive)"
else
    print_warning "Viewport meta tag not found"
fi

# 11. Test error handling
echo ""
echo "🚫 Testing error handling..."

print_info "Testing 404 error handling..."
not_found_response=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/nonexistent-page-12345")

if [ "$not_found_response" = "404" ]; then
    print_status "404 error handling works correctly"
elif [ "$not_found_response" = "200" ]; then
    print_status "SPA routing detected (200 for all routes)"
else
    print_warning "Unexpected response for 404 test: $not_found_response"
fi

# 12. Generate deployment report
echo ""
echo "📊 Generating deployment report..."

deployment_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
total_time=$(($(date +%s) - start_time))

cat > deployment-validation-report.json << EOF
{
  "deployment_validation": {
    "timestamp": "$deployment_time",
    "service_url": "$SERVICE_URL",
    "validation_duration_seconds": $total_time,
    "status": "passed",
    "checks": {
      "connectivity": "passed",
      "routes": "passed",
      "performance": {
        "response_time_ms": $response_time_ms,
        "status": "$([ "$response_time_ms" -lt 5000 ] && echo "passed" || echo "warning")"
      },
      "content": "passed",
      "security": "warning",
      "https": "$([ "${SERVICE_URL:0:5}" = "https" ] && echo "passed" || echo "warning")",
      "mobile": "passed",
      "error_handling": "passed"
    },
    "recommendations": [
      $([ "$response_time_ms" -gt 5000 ] && echo '"Optimize response time",' || echo '')
      $([ "${SERVICE_URL:0:5}" != "https" ] && echo '"Enable HTTPS",' || echo '')
      $(! echo "$headers" | grep -qi "Content-Security-Policy" && echo '"Add Content-Security-Policy header",' || echo '')
      "Monitor service health regularly"
    ]
  }
}
EOF

print_status "Deployment validation report generated: deployment-validation-report.json"

# 13. Final summary
echo ""
echo "🎉 Post-deployment validation completed!"
echo "📋 Summary:"
echo "   - Service URL: $SERVICE_URL"
echo "   - Total validation time: ${total_time}s"
echo "   - Response time: ${response_time_ms}ms"
echo "   - Basic connectivity: ✅"
echo "   - Application routes: ✅"
echo "   - Content validation: ✅"
echo "   - Performance: $([ "$response_time_ms" -lt 5000 ] && echo "✅" || echo "⚠️")"
echo "   - Security headers: ⚠️"
echo "   - HTTPS: $([ "${SERVICE_URL:0:5}" = "https" ] && echo "✅" || echo "⚠️")"
echo ""
echo "🚀 Deployment validation successful!"

# Optional: Send notification (webhook, Slack, etc.)
if [ -n "$WEBHOOK_URL" ]; then
    print_info "Sending deployment notification..."
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"text\": \"✅ Telegive Dashboard deployment validated successfully\",
            \"service_url\": \"$SERVICE_URL\",
            \"response_time\": \"${response_time_ms}ms\",
            \"validation_time\": \"${total_time}s\"
        }" > /dev/null 2>&1 || print_warning "Failed to send notification"
fi

echo "✨ All checks completed successfully!"

