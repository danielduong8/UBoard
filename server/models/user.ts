import { Model, UUIDV4, DataTypes } from "sequelize";

interface UserAttributes {
  /* Login Specific */
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string; // hash
  email: string;
  confirmed: boolean;

  /* Logs */
  lastLogin: Date;
  karma: Number;
}

/* Useful for typescript definitions of Users */
export class User extends Model<UserAttributes> implements UserAttributes {
  id!: string; // uuidv4
  firstName!: string;
  lastName!: string;
  userName!: string;
  password!: string;
  email!: string;
  confirmed!: boolean;

  lastLogin!: Date;
  karma!: Number; // Should not be revealed to public

  static associate(model: any) {
    User.hasMany(model.Post, { foreignKey: { allowNull: false } });
    User.hasMany(model.Comment, { foreignKey: { allowNull: false } });
    /* Userid is stored inside of respective Post, and Comment */
  }
}

module.exports = (sequelize: any) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      userName: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
        validate: {
          isAlphanumeric: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true /* Check for valid email format */,
          is: [".*@(mail.|alum.|)utoronto.ca"] /* Check for utoronto domain */,
        },
      },
      confirmed: {
        /* Email Confirmed */ type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      lastLogin: {
        type: DataTypes.DATE,
      },
      karma: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      indexes: [
        {
          unique: true,
          name: "unique_username", // validate case sensitive username
          fields: [sequelize.fn("lower", sequelize.col("userName"))],
        },
      ],
      hooks: {
        beforeValidate: (user, options) => {
          user.email = user.email.toLowerCase();
        },
      },
      modelName: "User",
      sequelize,
    }
  );

  return User;
};
