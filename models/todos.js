'use strict';
module.exports = function(sequelize, DataTypes) {
  var todos = sequelize.define('todos', {
    name: DataTypes.STRING,
    tag: DataTypes.TEXT,
    isCheck: DataTypes.BOOLEAN,
    isActive: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return todos;
};
