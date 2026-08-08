const mongoose = require('mongoose');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
require('dotenv').config();

const cleanupUnverifiedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boibabu');
    console.log('Connected to MongoDB');

    // Find all unverified users
    const unverifiedUsers = await User.find({ isEmailVerified: false });
    console.log(`Found ${unverifiedUsers.length} unverified users`);

    if (unverifiedUsers.length === 0) {
      console.log('No unverified users found');
      return;
    }

    let movedCount = 0;
    let deletedCount = 0;

    for (const user of unverifiedUsers) {
      try {
        // Check if user was created recently (within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (user.createdAt > sevenDaysAgo) {
          // Move recent unverified users to pending collection
          const existingPending = await PendingUser.findOne({ email: user.email });
          
          if (!existingPending) {
            await PendingUser.create({
              name: user.name,
              email: user.email,
              password: user.password, // Already hashed
              role: user.role,
              verificationToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            });
            movedCount++;
            console.log(`Moved ${user.email} to pending collection`);
          }
        }

        // Delete the unverified user from main collection
        await User.findByIdAndDelete(user._id);
        deletedCount++;

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error.message);
      }
    }

    console.log(`\nCleanup completed:`);
    console.log(`- Moved ${movedCount} recent users to pending collection`);
    console.log(`- Deleted ${deletedCount} unverified users from main collection`);

    // Show current state
    const remainingUnverified = await User.find({ isEmailVerified: false });
    const pendingCount = await PendingUser.countDocuments();
    const verifiedCount = await User.countDocuments({ isEmailVerified: true });

    console.log(`\nCurrent state:`);
    console.log(`- Verified users: ${verifiedCount}`);
    console.log(`- Pending users: ${pendingCount}`);
    console.log(`- Remaining unverified users: ${remainingUnverified.length}`);

  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the cleanup
if (require.main === module) {
  cleanupUnverifiedUsers();
}

module.exports = cleanupUnverifiedUsers;