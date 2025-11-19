// src/models/Indicio.js
module.exports = (sequelize, DataTypes) => {
  const Indicio = sequelize.define('Indicio', {
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expedienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Indicio.associate = (models) => {
    Indicio.belongsTo(models.Expediente, { foreignKey: 'expedienteId', as: 'expediente' });
  };

  return Indicio;
};
