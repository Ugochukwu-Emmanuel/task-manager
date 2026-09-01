const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/tasks.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(requireAuth);

const taskRules = [
  body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title is required'),
  body('description').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('category').optional().trim().isLength({ max: 100 }),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date must be a valid date'),
];

// title is required on create, but the same rule set is reused (with
// 'optional') for update, where every field is allowed to be omitted.
const createRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  ...taskRules.slice(1),
];

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createRules, validate, createTask);
router.put('/:id', taskRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;