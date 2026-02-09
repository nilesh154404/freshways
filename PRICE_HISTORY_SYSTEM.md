# Price History Tracking System

## Architecture Overview

This system implements a complete audit trail for product price changes using two tables:

### 1. **daily_price** (Current Prices Only)
Stores the current active price for each product-vendor combination.

**Fields:**
- `id`, `productId`, `vendorId`
- `amount` (current price)
- `mrp_amount` (current MRP)
- `isActive` (1 = current price)
- `date`, `createdAt`, `updatedAt`

### 2. **price_logs** (Complete History)
Stores every price change with before/after values.

**Fields:**
- `id`, `productId`, `vendorId`
- `old_amount` (price before change)
- `new_amount` (price after change)
- `old_mrp` (MRP before change)
- `new_mrp` (MRP after change)
- `changedAt` (timestamp of change)

---

## Price Update Flow

When a vendor/admin updates a price:

### STEP 1: Fetch Current Active Price
```typescript
const currentActive = await dailyPriceRepo.findOne({
  where: { productId, vendorId, isActive: true }
});
```

### STEP 2: Insert Price Log Entry
```typescript
if (currentActive && priceChanged) {
  await priceLogRepo.save({
    productId,
    vendorId,
    old_amount: currentActive.amount,
    new_amount: dto.amount,
    old_mrp: currentActive.mrp_amount,
    new_mrp: dto.mrp_amount
  });
}
```

### STEP 3: Update daily_price
```typescript
await dailyPriceRepo.save({
  amount: dto.amount,
  mrp_amount: dto.mrp_amount,
  isActive: true
});
```

---

## Cron Job Monitoring

**Schedule:** Every 5 minutes (configurable)

**Purpose:** Detect price changes made outside the normal flow (e.g., manual database edits, bulk imports)

```typescript
@Cron(CronExpression.EVERY_5_MINUTES)
async monitorPriceChanges() {
  // Get all active prices
  const activePrices = await dailyPriceRepo.find({ isActive: true });
  
  for (const price of activePrices) {
    // Get latest log entry
    const latestLog = await priceLogRepo.findOne({
      where: { productId, vendorId },
      order: { changedAt: 'DESC' }
    });
    
    // If price differs from last logged value, create new log
    if (!latestLog || latestLog.new_amount !== price.amount) {
      await priceLogRepo.save({ ... });
    }
  }
}
```

---

## API Endpoints

### Get Price History
```http
GET /daily-price/product/:productId/history?vendorId=<optional>
```

**Response:**
```json
[
  {
    "id": 123,
    "old_amount": 100.00,
    "new_amount": 101.00,
    "old_mrp": 150.00,
    "new_mrp": 151.00,
    "changedAt": "2026-02-04T10:30:00.000Z",
    "product": { "id": 1, "label": "Product A" },
    "vendor": { "id": 1, "businessName": "Vendor X" }
  },
  ...
]
```

---

## Frontend Implementation

### Main Table
Shows current active prices only (from `daily_price`)

### History Modal (Click "View")
Fetches complete price change history from `price_logs` API:
- Shows all price changes with timestamps
- Displays old → new values for each change
- Sorted by `changedAt` DESC (newest first)

---

## Benefits

✅ **Complete Audit Trail** - Never lose price history  
✅ **Multiple Changes Per Day** - Each edit is logged separately  
✅ **Database Integrity** - Cron job catches manual edits  
✅ **Performance** - Only load history when needed (lazy loading)  
✅ **Scalability** - price_logs grows independently of daily_price  

---

## Migration Steps

1. **Run SQL Migration**
   ```bash
   mysql -u root -p freshways < migrations/price_logs_migration.sql
   ```

2. **Restart NestJS Server**
   ```bash
   npm run start:dev
   ```
   TypeORM will auto-create the `price_logs` table if it doesn't exist.

3. **Verify**
   - Check that price_logs table exists
   - Make a test price change
   - Check that a new row appears in price_logs
   - View history in frontend

---

## Database Maintenance

### Important Rules:
- ❌ **NEVER** delete from `price_logs` (audit trail)
- ✅ Archive old logs if needed (keep last 2 years active)
- ✅ Index on `changedAt` for fast queries
- ✅ Index on `(productId, vendorId)` for lookups

### Archival Strategy (Optional)
```sql
-- Archive logs older than 2 years to separate table
CREATE TABLE price_logs_archive LIKE price_logs;

INSERT INTO price_logs_archive 
SELECT * FROM price_logs 
WHERE changedAt < DATE_SUB(NOW(), INTERVAL 2 YEAR);

DELETE FROM price_logs 
WHERE changedAt < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

---

## Testing Checklist

- [ ] Update a price → Check price_logs has new entry
- [ ] Update same price twice in 1 day → Check 2 separate log entries
- [ ] Wait 5 minutes → Check cron job runs without errors
- [ ] View history in UI → Check all changes display correctly
- [ ] Filter by product → Check only relevant history shows
- [ ] Test vendor role → Check vendor only sees their history

---

## Troubleshooting

**Issue:** No logs appearing after price update  
**Fix:** Check NestJS logs for errors, verify price actually changed

**Issue:** Cron job not running  
**Fix:** Ensure `@nestjs/schedule` is installed and imported in app.module

**Issue:** Frontend shows "Loading..." forever  
**Fix:** Check network tab, verify API endpoint returns data

**Issue:** Too many logs (performance)  
**Fix:** Add date range filter to query, implement pagination
