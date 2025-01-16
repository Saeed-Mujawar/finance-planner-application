module.exports = {
  async up(db, client) {
    try {
      console.log('Applying migration: Remove familyMembers field');
      const collection = db.collection('users');

      await collection.updateMany({}, {
        $unset: { familyMembers: "" },
      });
      console.log('Migration applied successfully');
    } catch (error) {
      console.error('Error applying migration:', error);
      throw error;
    }
  },

  async down(db, client) {
    try {
      console.log('Rolling back migration: Add familyMembers field');
      const collection = db.collection('users');


      await collection.updateMany({}, {
        $set: { familyMembers: [] },
      });
      console.log('Migration rolled back successfully');
    } catch (error) {
      console.error('Error rolling back migration:', error);
      throw error;
    }
  }
};
