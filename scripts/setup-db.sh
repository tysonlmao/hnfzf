#!/bin/bash

# Database Setup Script for HNFZF Local Development
# This script sets up PostgreSQL database for local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="hnfzf_dev"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5433"
CONTAINER_NAME="hnfzf-db-dev"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if PostgreSQL container exists and is running
check_postgres_container() {
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
        print_success "PostgreSQL container '$CONTAINER_NAME' is already running"
        return 0
    elif docker ps -aq -f name="$CONTAINER_NAME" | grep -q .; then
        print_warning "PostgreSQL container '$CONTAINER_NAME' exists but is not running"
        print_status "Starting existing container..."
        docker start "$CONTAINER_NAME"
        return 0
    else
        return 1
    fi
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    print_status "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts: PostgreSQL not ready yet, waiting..."
        sleep 2
        ((attempt++))
    done
    
    print_error "PostgreSQL failed to start after $max_attempts attempts"
    return 1
}

# Function to create database and tables
setup_database() {
    print_status "Setting up database schema..."
    
    # Check if init.sql exists
    if [ ! -f "init.sql" ]; then
        print_error "init.sql file not found in current directory"
        exit 1
    fi
    
    # Execute the init.sql script
    if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < init.sql; then
        print_success "Database schema created successfully"
    else
        print_error "Failed to create database schema"
        exit 1
    fi
}

# Function to insert sample data
insert_sample_data() {
    print_status "Inserting sample flag data..."
    
    # Create sample data SQL
    cat << 'EOF' | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
-- Sample product flags for testing
INSERT INTO product_flags (sku, flag_type, flag_value, additional_data, expiry_date) VALUES
('5921875', 'special_offer', 'Limited Time', '{"discount": "20%"}', '2024-12-31 23:59:59'),
('5921875', 'featured', 'homepage', '{"position": "banner", "priority": "high"}', NULL),
('5921875', 'warranty_extended', '3_years', '{"original": "1 year", "extended": "3 years"}', NULL),
('TEST123', 'clearance', 'final_sale', '{"original_price": "$299", "sale_price": "$199"}', '2024-06-30 23:59:59'),
('TEST123', 'stock_alert', 'low_stock', '{"quantity": 5, "threshold": 10}', NULL),
('DEMO456', 'new_arrival', 'this_month', '{"arrival_date": "2024-01-15", "category": "electronics"}', '2024-02-29 23:59:59'),
('DEMO456', 'best_seller', 'top_10', '{"rank": 3, "sales_last_month": 150}', NULL)
ON CONFLICT (sku, flag_type) DO NOTHING;
EOF

    if [ $? -eq 0 ]; then
        print_success "Sample data inserted successfully"
    else
        print_warning "Some sample data may already exist (this is normal)"
    fi
}

# Function to show connection info
show_connection_info() {
    echo ""
    print_success "Database setup complete!"
    echo ""
    echo -e "${BLUE}Connection Details:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  Username: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo ""
    echo -e "${BLUE}Environment Variable:${NC}"
    echo "  DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "  Connect to DB: docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME"
    echo "  View logs: docker logs $CONTAINER_NAME"
    echo "  Stop DB: docker stop $CONTAINER_NAME"
    echo "  Remove DB: docker rm -f $CONTAINER_NAME"
    echo ""
}

# Function to clean up (remove container and volume)
cleanup_database() {
    print_warning "This will remove the database container and ALL data!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Removing database container and data..."
        docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
        docker volume rm "hnfzf_postgres_dev_data" 2>/dev/null || true
        print_success "Database cleaned up successfully"
    else
        print_status "Cleanup cancelled"
    fi
}

# Main function
main() {
    echo -e "${BLUE}=== HNFZF Database Setup Script ===${NC}"
    echo ""
    
    # Parse command line arguments
    case "${1:-setup}" in
        "setup"|"")
            print_status "Starting database setup..."
            check_docker
            
            if ! check_postgres_container; then
                print_status "Creating new PostgreSQL container..."
                if ! docker-compose -f docker-compose.dev.yml up -d database; then
                    print_error "Failed to start PostgreSQL container"
                    exit 1
                fi
            fi
            
            wait_for_postgres
            setup_database
            insert_sample_data
            show_connection_info
            ;;
            
        "clean")
            cleanup_database
            ;;
            
        "restart")
            print_status "Restarting database..."
            docker restart "$CONTAINER_NAME"
            wait_for_postgres
            print_success "Database restarted successfully"
            ;;
            
        "logs")
            print_status "Showing database logs..."
            docker logs -f "$CONTAINER_NAME"
            ;;
            
        "connect")
            print_status "Connecting to database..."
            docker exec -it "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
            ;;
            
        "status")
            if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
                print_success "Database is running"
                show_connection_info
            else
                print_warning "Database is not running"
                echo "Run './scripts/setup-db.sh setup' to start it"
            fi
            ;;
            
        "help"|"-h"|"--help")
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  setup (default) - Set up and start the database"
            echo "  clean          - Remove database container and data"
            echo "  restart        - Restart the database container"
            echo "  logs           - Show database logs"
            echo "  connect        - Connect to the database"
            echo "  status         - Show database status"
            echo "  help           - Show this help message"
            ;;
            
        *)
            print_error "Unknown command: $1"
            echo "Run '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
