require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Category = require('../models/Category');
const ServiceRequest = require('../models/ServiceRequest');

const categories = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Technician',
  'Mechanic', 'Cleaner', 'Gardener', 'Construction Labor', 'Moving Labor',
  'House Helper', 'Other',
];

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Worker.deleteMany({}),
    Category.deleteMany({}),
    ServiceRequest.deleteMany({}),
  ]);

  console.log('Seeding categories...');
  await Category.insertMany(categories.map((name) => ({ name })));

  console.log('Seeding admin user...');
  await User.create({
    name: 'Admin',
    email: 'admin@laborlink.com',
    password: 'admin123',
    phone: '9999999999',
    role: 'admin',
  });

  console.log('Seeding sample customer...');
  await User.create({
    name: 'Riya Sharma',
    email: 'customer@laborlink.com',
    password: 'password123',
    phone: '9876500001',
    role: 'customer',
  });

  console.log('Seeding sample workers...');
  const workerData = [
    { name: 'Amit Kumar', email: 'worker1@laborlink.com', skills: ['Electrician'], city: 'Chennai' },
    { name: 'Suresh Babu', email: 'worker2@laborlink.com', skills: ['Plumber'], city: 'Chennai' },
    { name: 'Ravi Verma', email: 'worker3@laborlink.com', skills: ['Cleaner', 'House Helper'], city: 'Trichy' },
  ];

  for (const w of workerData) {
    const user = await User.create({
      name: w.name,
      email: w.email,
      password: 'password123',
      phone: '9876500002',
      role: 'worker',
    });
    await Worker.create({
      userId: user._id,
      skills: w.skills,
      experience: 3,
      location: { city: w.city },
      serviceArea: w.city,
      hourlyRate: 300,
      verified: 'approved',
      availability: 'available',
    });
  }

  console.log('Seed complete. Sample logins:');
  console.log('  Admin:    admin@laborlink.com / admin123');
  console.log('  Customer: customer@laborlink.com / password123');
  console.log('  Worker:   worker1@laborlink.com / password123');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
