const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('postgres://user:password@localhost:5432/mydb');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    phoneNumber: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false
    },
    // passwordHash: {
    //     type: DataTypes.TEXT,
    //     allowNull: false
    // }
}, {});
const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        field: 'userId',
        references: {
            model: User,
            key: 'id'
        },
        allowNull: false
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // tokensUsed: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // }
}, {});

User.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(User, { foreignKey: 'userId' });

sequelize.sync();