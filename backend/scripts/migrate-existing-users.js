const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateExistingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boibabu');
    console.log('Connected to MongoDB');

    // Find all users who don't have isEmailVerified set or it's false
    const usersToUpdate = await User.find({
      $or: [
        { isEmailVerified: { $exists: false } },
        { isEmailVerified: false }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length === 0) {
      console.log('No users need to be updated');
      return;
    }

    // Update all existing users to mark them as email verified
    // This is for users who were created before the email verification system
    const result = await User.updateMany(
      {
        $or: [
          { isEmailVerified: { $exists: false } },
          { isEmailVerified: false }
        ],
        // Only update users created before today (existing users)
        createdAt: { $lt: new Date() }
      },
      {
        $set: { isEmailVerified: true }
      }
    );

    console.log(`Updated ${result.modifiedCount} existing users to mark them as email verified`);
    
    // Show some examples of updated users
    const updatedUsers = await User.find({ isEmailVerified: true }).limit(5);
    console.log('Sample updated users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt}`);
    });

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the migration
if (require.main === module) {
  migrateExistingUsers();
}

module.exports = migrateExistingUsers;