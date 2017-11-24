

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    subscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  return User;
};
