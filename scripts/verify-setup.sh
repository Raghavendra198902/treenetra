#!/bin/bash

#######################################
# TreeNetra Setup Verification Script
# Checks if all components are properly configured
#######################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   TreeNetra Setup Verification${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

#######################################
# Check Node.js
#######################################
echo -e "${BLUE}[1/15]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Node.js version $NODE_VERSION is too old (need 18+)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Node.js is not installed"
    ((FAILED++))
fi

#######################################
# Check npm
#######################################
echo -e "${BLUE}[2/15]${NC} Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} npm is not installed"
    ((FAILED++))
fi

#######################################
# Check MongoDB
#######################################
echo -e "${BLUE}[3/15]${NC} Checking MongoDB..."
if command -v mongod &> /dev/null; then
    MONGO_VERSION=$(mongod --version | head -n1 | awk '{print $3}')
    echo -e "${GREEN}✓${NC} MongoDB $MONGO_VERSION installed"
    ((PASSED++))
    
    # Check if MongoDB is running
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✓${NC} MongoDB is running"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} MongoDB is installed but not running"
        echo -e "   Start with: sudo systemctl start mongod"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} MongoDB is not installed (optional with Docker)"
    ((WARNINGS++))
fi

#######################################
# Check Redis
#######################################
echo -e "${BLUE}[4/15]${NC} Checking Redis..."
if command -v redis-server &> /dev/null; then
    REDIS_VERSION=$(redis-server --version | awk '{print $3}' | cut -d'=' -f2)
    echo -e "${GREEN}✓${NC} Redis $REDIS_VERSION installed"
    ((PASSED++))
    
    # Check if Redis is running
    if pgrep -x "redis-server" > /dev/null; then
        echo -e "${GREEN}✓${NC} Redis is running"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Redis is installed but not running"
        echo -e "   Start with: sudo systemctl start redis"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Redis is not installed (optional with Docker)"
    ((WARNINGS++))
fi

#######################################
# Check Docker
#######################################
echo -e "${BLUE}[5/15]${NC} Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Docker $DOCKER_VERSION installed"
    ((PASSED++))
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Docker is installed but daemon is not running"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Docker is not installed (optional)"
    ((WARNINGS++))
fi

#######################################
# Check Docker Compose
#######################################
echo -e "${BLUE}[6/15]${NC} Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
    echo -e "${GREEN}✓${NC} Docker Compose $COMPOSE_VERSION installed"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Docker Compose is not installed (optional)"
    ((WARNINGS++))
fi

#######################################
# Check Git
#######################################
echo -e "${BLUE}[7/15]${NC} Checking Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} Git $GIT_VERSION installed"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Git is not installed"
    ((FAILED++))
fi

#######################################
# Check Project Files
#######################################
echo -e "${BLUE}[8/15]${NC} Checking project files..."
REQUIRED_FILES=(
    "package.json"
    "src/index.js"
    "src/App.jsx"
    "src/main.jsx"
    ".env.example"
    "Dockerfile"
    "docker-compose.yml"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is missing"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = true ]; then
    ((PASSED++))
else
    ((FAILED++))
fi

#######################################
# Check Dependencies
#######################################
echo -e "${BLUE}[9/15]${NC} Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} node_modules not found. Run: npm install"
    ((WARNINGS++))
fi

#######################################
# Check Environment File
#######################################
echo -e "${BLUE}[10/15]${NC} Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    ((PASSED++))
    
    # Check required variables
    REQUIRED_VARS=(
        "NODE_ENV"
        "PORT"
        "MONGODB_URI"
        "JWT_SECRET"
    )
    
    ALL_VARS_SET=true
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${RED}✗${NC} $var is not set in .env"
            ALL_VARS_SET=false
        fi
    done
    
    if [ "$ALL_VARS_SET" = true ]; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found. Copy from .env.example"
    ((WARNINGS++))
fi

#######################################
# Check Source Files
#######################################
echo -e "${BLUE}[11/15]${NC} Checking source files..."
SRC_COUNT=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
if [ "$SRC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $SRC_COUNT source files"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} No source files found"
    ((FAILED++))
fi

#######################################
# Check Documentation
#######################################
echo -e "${BLUE}[12/15]${NC} Checking documentation..."
DOC_FILES=(
    "README.md"
    "QUICKSTART.md"
    "API.md"
    "docs/DEPLOYMENT.md"
    "docs/DEVELOPMENT.md"
    "docs/TESTING.md"
)

DOC_COUNT=0
for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        ((DOC_COUNT++))
    fi
done

if [ "$DOC_COUNT" -eq "${#DOC_FILES[@]}" ]; then
    echo -e "${GREEN}✓${NC} All documentation files present ($DOC_COUNT/${#DOC_FILES[@]})"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Some documentation files missing ($DOC_COUNT/${#DOC_FILES[@]})"
    ((WARNINGS++))
fi

#######################################
# Check Scripts
#######################################
echo -e "${BLUE}[13/15]${NC} Checking utility scripts..."
SCRIPTS_DIR="scripts"
if [ -d "$SCRIPTS_DIR" ]; then
    SCRIPT_COUNT=$(find $SCRIPTS_DIR -name "*.sh" | wc -l)
    if [ "$SCRIPT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $SCRIPT_COUNT shell scripts"
        ((PASSED++))
        
        # Check if scripts are executable
        NON_EXEC=$(find $SCRIPTS_DIR -name "*.sh" ! -executable | wc -l)
        if [ "$NON_EXEC" -eq 0 ]; then
            echo -e "${GREEN}✓${NC} All scripts are executable"
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} $NON_EXEC scripts are not executable. Run: chmod +x scripts/*.sh"
            ((WARNINGS++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} No shell scripts found in scripts/"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} scripts/ directory not found"
    ((WARNINGS++))
fi

#######################################
# Check Ports
#######################################
echo -e "${BLUE}[14/15]${NC} Checking ports availability..."
PORTS_TO_CHECK=(3000 5173 27017 6379)
PORTS_AVAILABLE=true

for port in "${PORTS_TO_CHECK[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} Port $port is already in use"
        PORTS_AVAILABLE=false
    else
        echo -e "${GREEN}✓${NC} Port $port is available"
    fi
done

if [ "$PORTS_AVAILABLE" = true ]; then
    ((PASSED++))
else
    ((WARNINGS++))
    echo -e "   Note: This is normal if services are already running"
fi

#######################################
# Check Disk Space
#######################################
echo -e "${BLUE}[15/15]${NC} Checking disk space..."
AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$AVAILABLE" -ge 2 ]; then
    echo -e "${GREEN}✓${NC} Sufficient disk space (${AVAILABLE}GB available)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Low disk space (${AVAILABLE}GB available, recommend 2GB+)"
    ((WARNINGS++))
fi

#######################################
# Summary
#######################################
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Verification Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "  ${RED}Failed:${NC}   $FAILED"
echo ""

#######################################
# Recommendations
#######################################
if [ $FAILED -gt 0 ] || [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Recommendations:${NC}"
    echo ""
    
    if [ $FAILED -gt 0 ]; then
        echo -e "${RED}Critical Issues:${NC}"
        echo "  • Install missing required software (Node.js, npm, Git)"
        echo "  • Ensure all required project files are present"
        echo "  • Configure environment variables in .env file"
        echo ""
    fi
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Optional Improvements:${NC}"
        echo "  • Install MongoDB locally or use Docker"
        echo "  • Install Redis locally or use Docker"
        echo "  • Install Docker for containerized deployment"
        echo "  • Run 'npm install' to install dependencies"
        echo "  • Copy .env.example to .env and configure"
        echo "  • Make scripts executable: chmod +x scripts/*.sh"
        echo ""
    fi
fi

#######################################
# Quick Start Commands
#######################################
echo -e "${BLUE}Quick Start Commands:${NC}"
echo ""
echo "  # Install dependencies"
echo "  npm install"
echo ""
echo "  # Setup environment"
echo "  cp .env.example .env"
echo "  # Edit .env with your settings"
echo ""
echo "  # Setup database"
echo "  npm run setup:db"
echo "  npm run seed:db"
echo ""
echo "  # Start development"
echo "  npm run dev"
echo ""
echo "  # Or use Docker"
echo "  npm run docker:up"
echo ""

#######################################
# Exit Status
#######################################
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Setup verification completed successfully!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Setup verification found critical issues.${NC}"
    echo -e "  Please fix the failed checks above before proceeding."
    echo ""
    exit 1
fi
