module.exports = (sequelize, type) => {
    return sequelize.define('conversation', {
        participants: { type: type.STRING, defaultValue: true},
        name: { type: type.STRING, defaultValue: true},

    },{timestamps: false});
};