const { Router } = require('express');
const { listar, crear, actualizar, eliminar } = require('../controllers/productosController');

const router = Router();

router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 4294967295) {
    return res.status(400).json({ error: 'El ID debe ser un entero positivo válido.' });
  }
  return next();
});

router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
