#!/bin/bash

# TreeNetra - Database Setup Script
# This script sets up MongoDB collections and indexes

echo "🌳 TreeNetra Database Setup"
echo "============================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    exit 1
fi

echo "✓ MongoDB is running"

# Database name
DB_NAME="treenetra"

echo ""
echo "Setting up database: $DB_NAME"
echo ""

# Create collections and indexes
mongosh $DB_NAME <<EOF

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
print("✓ Users indexes created");

// Trees collection
db.trees.createIndex({ "treeId": 1 }, { unique: true });
db.trees.createIndex({ "location.coordinates": "2dsphere" });
db.trees.createIndex({ "speciesId": 1 });
db.trees.createIndex({ "status": 1 });
db.trees.createIndex({ "createdBy": 1 });
print("✓ Trees indexes created");

// Species collection
db.species.createIndex({ "scientificName": 1 }, { unique: true });
db.species.createIndex({ 
  "commonName": "text", 
  "scientificName": "text", 
  "family": "text" 
});
print("✓ Species indexes created");

// Health Records collection
db.healthrecords.createIndex({ "treeId": 1, "inspectionDate": -1 });
db.healthrecords.createIndex({ "status": 1 });
db.healthrecords.createIndex({ "inspectedBy": 1 });
print("✓ Health Records indexes created");

// Refresh Tokens collection
db.refreshtokens.createIndex({ "userId": 1 });
db.refreshtokens.createIndex({ "token": 1 });
db.refreshtokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
print("✓ Refresh Tokens indexes created");

print("");
print("✅ Database setup completed successfully!");

EOF

echo ""
echo "✅ All indexes created successfully!"
echo ""
