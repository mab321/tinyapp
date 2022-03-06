const emailExists = function(email, usersDB) {

  for (const account in usersDB) {
    if (usersDB[account].email === email) {
      return true;
    }
  }

  return false;
}

const getUserIdByEmail = function(email, usersDB) {

  for (const acc in usersDB) {
    if (usersDB[acc].email === email) {
      return usersDB[acc].id;
    }
  }

  return false;
}

const urlForUser = function(userId, urlDB) {
  const userUrls = {};

  for (const urls in urlDB) {
    if (urlDB[urls].userID === userId) {
      userUrls[urls] = urlDB[urls];
    }
  }
  return userUrls;
}



module.exports = {
  emailExists,
  getUserIdByEmail,
  urlForUser
}