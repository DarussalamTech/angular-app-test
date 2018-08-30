module.exports = (sequelize, type) => {
    return sequelize.define('user', {
      username: { type: type.STRING, defaultValue: true},
      password: { type: type.STRING, defaultValue: true},
      role: {type:   type.ENUM, values: ['Buyer', 'Seller']},
      status: {type:   type.ENUM, values: ['Online', 'Offline']},

  },{timestamps: false});
};