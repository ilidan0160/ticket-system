const { Op, Sequelize } = require('sequelize');
const { Ticket, User } = require('../models');
const logger = require('./logger');

// Tiempo de caché en segundos (5 minutos)
const CACHE_TTL = 300;

/**
 * Obtiene estadísticas básicas de tickets de manera optimizada
 * @param {Object} where - Condiciones de filtrado
 * @param {Object} transaction - Transacción de base de datos
 * @returns {Promise<Object>} Estadísticas de tickets
 */
const getBasicStats = async (where, transaction) => {
  try {
    const [result] = await Ticket.findAll({
      attributes: [
        // Conteos básicos
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalCount'],
        [Sequelize.literal("COUNT(CASE WHEN estatus = 'abierto' THEN 1 END)"), 'openCount'],
        [Sequelize.literal("COUNT(CASE WHEN estatus = 'en_progreso' THEN 1 END)"), 'inProgressCount'],
        [Sequelize.literal("COUNT(CASE WHEN estatus IN ('Cerrado', 'Resuelto') THEN 1 END)"), 'closedCount'],
        
        // Tiempo promedio de resolución
        [Sequelize.literal('AVG(TIMESTAMPDIFF(HOUR, createdAt, fechaCierre))'), 'avgResolutionHours'],
        
        // Agregados JSON para conteos agrupados
        [Sequelize.literal(`JSON_OBJECTAGG(
          COALESCE(estatus, 'sin_estado'), 
          COUNT(CASE WHEN estatus IS NOT NULL THEN 1 END)
        )`), 'statusCounts'],
        
        [Sequelize.literal(`JSON_OBJECTAGG(
          COALESCE(prioridad, 'sin_prioridad'), 
          COUNT(CASE WHEN prioridad IS NOT NULL THEN 1 END)
        )`), 'priorityCounts'],
        
        [Sequelize.literal(`JSON_OBJECTAGG(
          COALESCE(departamento, 'sin_departamento'), 
          COUNT(CASE WHEN departamento IS NOT NULL THEN 1 END)
        )`), 'departmentCounts']
      ],
      where: {
        ...where,
        [Op.or]: [
          { fechaCierre: null },
          { 
            fechaCierre: { [Op.ne]: null },
            estatus: { [Op.in]: ['Cerrado', 'Resuelto'] }
          }
        ]
      },
      raw: true,
      transaction,
      // Forzar el uso de índices
      indexHints: [
        { type: 'USE', values: ['idx_estatus'] },
        { type: 'USE', values: ['idx_prioridad'] },
        { type: 'USE', values: ['idx_departamento'] }
      ]
    });

    return {
      total: parseInt(result.totalCount) || 0,
      open: parseInt(result.openCount) || 0,
      inProgress: parseInt(result.inProgressCount) || 0,
      closed: parseInt(result.closedCount) || 0,
      byStatus: JSON.parse(result.statusCounts || '{}'),
      byPriority: JSON.parse(result.priorityCounts || '{}'),
      byDepartment: JSON.parse(result.departmentCounts || '{}'),
      avgResolutionHours: parseFloat(result.avgResolutionHours) || 0
    };
  } catch (error) {
    logger.error('Error en getBasicStats:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de asignación de tickets
 * @param {Object} where - Condiciones de filtrado
 * @param {Object} transaction - Transacción de base de datos
 * @returns {Promise<Array>} Estadísticas de asignación
 */
const getAssignmentStats = async (where, transaction) => {
  try {
    const results = await Ticket.findAll({
      attributes: [
        'assignedTo',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.literal("SUM(CASE WHEN estatus = 'abierto' THEN 1 ELSE 0 END)"), 'open'],
        [Sequelize.literal("SUM(CASE WHEN estatus = 'en_progreso' THEN 1 ELSE 0 END)"), 'inProgress'],
        [Sequelize.literal('AVG(TIMESTAMPDIFF(HOUR, createdAt, COALESCE(fechaCierre, NOW())))'), 'avgAgeHours']
      ],
      where: {
        ...where,
        assignedTo: { [Op.ne]: null }
      },
      include: [{
        model: User,
        as: 'assignedToUser',
        attributes: ['id', 'username', 'email', 'role'],
        required: true
      }],
      group: ['assignedTo'],
      raw: false,
      transaction,
      // Forzar el uso de índices
      indexHints: [
        { type: 'USE', values: ['idx_assigned_to'] },
        { type: 'USE', values: ['idx_estatus'] }
      ]
    });

    return results.map(stat => ({
      userId: stat.assignedToUser.id,
      username: stat.assignedToUser.username,
      email: stat.assignedToUser.email,
      role: stat.assignedToUser.role,
      total: parseInt(stat.get('total')) || 0,
      open: parseInt(stat.get('open')) || 0,
      inProgress: parseInt(stat.get('inProgress')) || 0,
      avgAgeDays: ((parseFloat(stat.get('avgAgeHours')) || 0) / 24).toFixed(1)
    }));
  } catch (error) {
    logger.error('Error en getAssignmentStats:', error);
    throw error;
  }
};

/**
 * Obtiene datos de tendencia para los últimos 7 días
 * @param {Object} where - Condiciones de filtrado
 * @param {Object} transaction - Transacción de base de datos
 * @returns {Promise<Array>} Datos de tendencia
 */
const getTrendData = async (where, transaction) => {
  try {
    const trendData = [];
    const today = new Date();
    
    // Usar una sola consulta para obtener todos los conteos
    const trendResults = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        ...where,
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(today.getDate() - 6)).setHours(0, 0, 0, 0),
          [Op.lte]: new Date().setHours(23, 59, 59, 999)
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      raw: true,
      transaction,
      // Forzar el uso de índice de fecha
      indexHints: [
        { type: 'USE', values: ['idx_created_at'] }
      ]
    });

    // Crear un mapa de fechas para búsqueda rápida
    const dateMap = new Map(
      trendResults.map(item => [
        new Date(item.date).toISOString().split('T')[0], 
        parseInt(item.count)
      ])
    );

    // Rellenar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trendData.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0
      });
    }

    return trendData;
  } catch (error) {
    logger.error('Error en getTrendData:', error);
    throw error;
  }
};

/**
 * Obtiene el promedio diario de tickets de los últimos 30 días
 * @param {Object} where - Condiciones de filtrado
 * @param {Object} transaction - Transacción de base de datos
 * @returns {Promise<number>} Promedio diario
 */
const getDailyAverage = async (where, transaction) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Ticket.findOne({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.fn('DATEDIFF', 
          Sequelize.fn('NOW'), 
          Sequelize.fn('LEAST', 
            Sequelize.fn('NOW'), 
            Sequelize.fn('MAX', Sequelize.col('createdAt'))
          )
        ), 'daysDiff']
      ],
      where: {
        ...where,
        createdAt: { [Op.gte]: thirtyDaysAgo }
      },
      raw: true,
      transaction,
      // Forzar el uso de índice de fecha
      indexHints: [
        { type: 'USE', values: ['idx_created_at'] }
      ]
    });

    const total = parseInt(result?.total) || 0;
    const daysDiff = Math.max(parseInt(result?.daysDiff) || 30, 1); // Mínimo 1 día para evitar división por cero
    
    return (total / daysDiff).toFixed(1);
  } catch (error) {
    logger.error('Error en getDailyAverage:', error);
    throw error;
  }
};

module.exports = {
  CACHE_TTL,
  getBasicStats,
  getAssignmentStats,
  getTrendData,
  getDailyAverage
};
