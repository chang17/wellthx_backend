module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('Member', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        username: { type: DataTypes.STRING, allowNull: false },
        fullname: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        sponsor_id: { type: DataTypes.INTEGER, allowNull: true }
    }, {
        tableName: 'members',
        timestamps: false
    });
    return Member;
};
