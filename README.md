# Migrate Mongo - Usage Guide

## 1. Install `migrate-mongo`
To install the `migrate-mongo` package, run the following command:

```bash
npm install migrate-mongo
```

## 2. Initialize Migration Configuration
To initialize the migration configuration, run:
```bash
npx migrate-mongo init
```

This will create a migrate-mongo-config.js file in your project where you can specify your database connection details (e.g., MongoDB URI).

## 3. Create a New Migration
To create a new migration file, run:
```bash
npx migrate-mongo create <migration-name>
```

This will generate a new migration file in the migrations folder. Edit the generated file to define the up and down methods.

## 4. Apply Migrations (Up)
```bash
npx migrate-mongo up
```
This will execute all pending migrations and apply them to your MongoDB database.

## 5. Revert Migrations (Down)
```bash
npx migrate-mongo down
```
This will undo the last applied migration (by running the down method).

## 6. Check Migration Status
```bash
npx migrate-mongo status
```
This will display which migrations have been applied and which ones are pending.

