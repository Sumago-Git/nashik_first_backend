const express = require('express');
const { upload } = require('../middleware/multer');
const { validateOffice, validateOfficeId } = require('../validations/officeValidation');
const {
  addOffice,
  updateOffice,
  getOffices,
  toggleOfficeStatus,
  toggleOfficeDelete,
} = require('../controllers/officeController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/create-office', authenticateToken, validateOffice, addOffice);
router.put('/update-office/:id', authenticateToken, validateOffice, validateOfficeId, updateOffice);
router.get('/get-offices', getOffices);
router.get('/find-offices', authenticateToken, getOffices);
router.put('/isactive-office/:id', authenticateToken, validateOfficeId, toggleOfficeStatus);
router.delete('/isdelete-office/:id', authenticateToken, validateOfficeId, toggleOfficeDelete);

module.exports = router;
