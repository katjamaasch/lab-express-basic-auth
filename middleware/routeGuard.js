const routeGuard = (req, res, next) => {
    if (req.user) {
      next();
    } else {
      next(new Error('You need to log in first.'));
    }
  };

  module.exports=(routeGuard);