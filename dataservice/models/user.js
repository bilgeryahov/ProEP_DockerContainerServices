module.exports = (sequelize, DataTypes) => {
  const userSubscription = sequelize.define('UserSubscription', {
  });
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
  });

  User.belongsToMany(User, { as: 'SubscribeTo', through: { model: userSubscription }, foreignKey: 'subscriberid' });
  return User;
};
