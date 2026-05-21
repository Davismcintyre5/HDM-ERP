const Report = require('../../models/tenant/Report');
const logger = require('../../utils/logger');

/**
 * @desc    Get saved reports
 * @route   GET /api/tenant/reports
 * @access  Private (Tenant)
 */
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ tenantId: req.tenantId });
    res.json({ success: true, data: reports });
  } catch (err) {
    logger.error('Get reports error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * @desc    Save a report
 * @route   POST /api/tenant/reports
 * @access  Private (Tenant)
 */
const saveReport = async (req, res) => {
  try {
    const report = await Report.create({ tenantId: req.tenantId, ...req.body });
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    logger.error('Save report error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * @desc    Run report engine (simple stub)
 * @route   GET /api/tenant/reports/engine/:id
 * @access  Private (Tenant)
 */
const runReport = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    // Stub: return report definition
    res.json({ success: true, data: report });
  } catch (err) {
    logger.error('Run report error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * @desc    Delete report
 * @route   DELETE /api/tenant/reports/:id
 * @access  Private (Tenant)
 */
const deleteReport = async (req, res) => {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    logger.error('Delete report error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getReports, saveReport, runReport, deleteReport };