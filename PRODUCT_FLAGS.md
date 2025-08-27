# Product Flags System

This document describes the product flags/tagging system that allows you to add additional data to products based on their SKU.

## Overview

The system allows you to tag products with additional metadata that will be displayed in the API responses and frontend UI. This is useful for:

- Special promotions and offers
- Featured product designations
- Stock alerts and warnings
- Extended warranty information
- Custom product attributes

## Database Structure

### `product_flags` table

| Column            | Type      | Description                                                   |
| ----------------- | --------- | ------------------------------------------------------------- |
| `id`              | SERIAL    | Primary key                                                   |
| `sku`             | TEXT      | Product SKU (must match `product_id` from products table)     |
| `flag_type`       | TEXT      | Type of flag (e.g., 'special_offer', 'featured', 'clearance') |
| `flag_value`      | TEXT      | Optional value for the flag                                   |
| `additional_data` | JSONB     | Additional structured data                                    |
| `description`     | TEXT      | Human-readable description                                    |
| `created_at`      | TIMESTAMP | When the flag was created                                     |
| `updated_at`      | TIMESTAMP | When the flag was last updated                                |

## API Endpoints

### Get Product with Flags

```
GET /api/product/:code
```

Returns products with their associated flags included in the response.

### Manage Product Flags

#### Add a flag to a product

```
POST /api/product/:sku/flags
Content-Type: application/json

{
  "flagType": "special_offer",
  "flagValue": "Limited Time",
  "additionalData": {"discount": "20%", "expires": "2024-12-31"},
  "description": "Special promotional pricing available"
}
```

#### Get all flags for a product

```
GET /api/product/:sku/flags
```

#### Delete a specific flag

```
DELETE /api/product/:sku/flags/:flagId
```

## Frontend Display

Products with flags will show:

1. **In Product Cards**:

   - Red "Tagged" badge in top-left corner
   - Flag details displayed below price

2. **In Product Details Dialog**:
   - Flag count in product details section
   - Detailed flag information with type, value, description, and additional data

## Example Usage

### Adding a Special Offer Flag

```bash
curl -X POST http://localhost:1337/api/product/5921875/flags \
  -H "Content-Type: application/json" \
  -d '{
    "flagType": "special_offer",
    "flagValue": "20% Off",
    "additionalData": {"discount": "20%", "expires": "2024-12-31"},
    "description": "Limited time promotional pricing"
  }'
```

### Adding a Featured Product Flag

```bash
curl -X POST http://localhost:1337/api/product/5921875/flags \
  -H "Content-Type: application/json" \
  -d '{
    "flagType": "featured",
    "flagValue": "homepage",
    "additionalData": {"position": "banner", "priority": "high"},
    "description": "Featured product on homepage"
  }'
```

## Sample Data

To test the system, you can run the provided SQL file:

```bash
# Connect to your PostgreSQL database and run:
\i test-flags.sql
```

This will add sample flags for SKU `5921875` and `TEST123`.

## Common Flag Types

- `special_offer` - Promotional pricing
- `featured` - Featured product designation
- `clearance` - Clearance/sale items
- `stock_alert` - Stock level warnings
- `warranty_extended` - Extended warranty options
- `new_arrival` - New product designation
- `best_seller` - Popular products
- `seasonal` - Seasonal availability

## Notes

- Flags are automatically included in product API responses
- The system supports multiple flags per product
- Additional data is stored as JSONB for flexible structured information
- Flags can be used for business logic, display customization, and reporting
