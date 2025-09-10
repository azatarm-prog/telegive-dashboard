#!/bin/bash

# Telegive Dashboard Deployment Script
# This script handles building and deploying the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="telegive-dashboard"
DOCKER_IMAGE="$APP_NAME:latest"
CONTAINER_NAME="$APP_NAME-container"
PORT=3000

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_info "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        log_warn "Docker Compose is not installed. Some features may not be available."
    else
        log_info "Docker Compose is installed"
    fi
}

# Build the application
build_app() {
    log_info "Building the application..."
    
    # Install dependencies
    if command -v pnpm &> /dev/null; then
        pnpm install
        pnpm run build
    elif command -v yarn &> /dev/null; then
        yarn install
        yarn build
    else
        npm install
        npm run build
    fi
    
    log_info "Application built successfully"
}

# Build Docker image
build_docker() {
    log_info "Building Docker image..."
    docker build -t $DOCKER_IMAGE .
    log_info "Docker image built successfully"
}

# Stop existing container
stop_container() {
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        log_info "Stopping existing container..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi
}

# Run the container
run_container() {
    log_info "Starting new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:3000 \
        --restart unless-stopped \
        $DOCKER_IMAGE
    
    log_info "Container started successfully"
    log_info "Application is running at http://localhost:$PORT"
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose..."
    docker-compose down
    docker-compose up -d --build
    log_info "Deployment completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    sleep 5
    
    if curl -f http://localhost:$PORT > /dev/null 2>&1; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Clean up old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f
    log_info "Cleanup completed"
}

# Main deployment function
deploy() {
    log_info "Starting deployment of $APP_NAME..."
    
    check_docker
    check_docker_compose
    
    case "$1" in
        "docker")
            build_app
            build_docker
            stop_container
            run_container
            health_check
            cleanup
            ;;
        "compose")
            deploy_compose
            health_check
            cleanup
            ;;
        "build-only")
            build_app
            ;;
        "docker-only")
            build_docker
            stop_container
            run_container
            health_check
            ;;
        *)
            log_info "Usage: $0 {docker|compose|build-only|docker-only}"
            log_info "  docker      - Build app and Docker image, then run container"
            log_info "  compose     - Deploy using Docker Compose"
            log_info "  build-only  - Only build the application"
            log_info "  docker-only - Only build and run Docker container"
            exit 1
            ;;
    esac
    
    log_info "Deployment completed successfully!"
}

# Run deployment
deploy "$1"

