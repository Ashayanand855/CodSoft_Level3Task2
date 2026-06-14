const express = require('express');
const router = express.Router();
const {
  getTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

router.route('/')
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
