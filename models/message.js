module.exports = (sequelize, type) => {
    return sequelize.define('message', {
        mine: {type: type.BOOLEAN },
        created: { type: type.DATE},
        from:{type: type.INTEGER},
        text: { type: type.STRING},
        conversationId: {type: type.INTEGER }

    },{timestamps: false});
};