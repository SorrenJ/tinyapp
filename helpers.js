const getUserByEmail = (email, users) => {
    for (const userId in users) {
      const userFromDb = users[userId];
      if (userFromDb.email === email) {
        // User is found
        return userId;
      }
    }
  
    return null;
  };

  module.exports = {
getUserByEmail
  };