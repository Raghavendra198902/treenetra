#!/bin/bash

# TreeNetra - Seed Database Script
# This script populates the database with sample data

echo "🌱 TreeNetra Database Seeding"
echo "=============================="

DB_NAME="treenetra"

echo "Seeding database: $DB_NAME"
echo ""

node << 'EOF'
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const Species = require('../src/models/species.model');
const Tree = require('../src/models/tree.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/treenetra';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Species.deleteMany({});
    await Tree.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@treenetra.com',
      password: 'Admin@123',
      fullName: 'System Administrator',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    console.log('✓ Admin user created');

    // Create species
    const species = await Species.insertMany([
      {
        commonName: 'Oak Tree',
        scientificName: 'Quercus robur',
        family: 'Fagaceae',
        genus: 'Quercus',
        nativeRegion: 'Europe',
        characteristics: {
          maxHeight: 40,
          growthRate: 'slow',
          lifespan: 1000,
          leafType: 'deciduous'
        }
      },
      {
        commonName: 'Maple Tree',
        scientificName: 'Acer saccharum',
        family: 'Sapindaceae',
        genus: 'Acer',
        nativeRegion: 'North America',
        characteristics: {
          maxHeight: 35,
          growthRate: 'moderate',
          lifespan: 400,
          leafType: 'deciduous'
        }
      },
      {
        commonName: 'Pine Tree',
        scientificName: 'Pinus sylvestris',
        family: 'Pinaceae',
        genus: 'Pinus',
        nativeRegion: 'Europe and Asia',
        characteristics: {
          maxHeight: 35,
          growthRate: 'fast',
          lifespan: 300,
          leafType: 'evergreen'
        }
      }
    ]);
    console.log(`✓ ${species.length} species created`);

    // Create sample trees
    const trees = await Tree.insertMany([
      {
        speciesId: species[0]._id,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        plantedDate: new Date('2020-01-15'),
        height: 15,
        diameter: 0.3,
        status: 'healthy',
        healthScore: 95,
        createdBy: admin._id
      },
      {
        speciesId: species[1]._id,
        location: {
          type: 'Point',
          coordinates: [-122.4184, 37.7739],
          address: '456 Park Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        },
        plantedDate: new Date('2019-05-20'),
        height: 12,
        diameter: 0.25,
        status: 'healthy',
        healthScore: 90,
        createdBy: admin._id
      }
    ]);
    console.log(`✓ ${trees.length} trees created`);

    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email: admin@treenetra.com');
    console.log('Password: Admin@123');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
EOF
