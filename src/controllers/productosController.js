const pool = require('../config/db');

function validarProducto(body) {
  const { nombre, precio, stock } = body ?? {};
  if (typeof nombre !== 'string' || !nombre.trim() || [...nombre.trim()].length > 120) {
    return 'El nombre debe tener entre 1 y 120 caracteres.';
  }
  if (typeof precio !== 'number' || precio < 0 || precio > 99999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(String(precio))) {
    return 'El precio debe estar entre 0 y 99999999.99 y tener como máximo dos decimales.';
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 4294967295) {
    return 'El stock debe ser un entero entre 0 y 4294967295.';
  }
}

async function listar(req, res, next) {
  try {
    const [productos] = await pool.execute('SELECT id, nombre, precio, stock FROM productos ORDER BY id');
    return res.json(productos);
  } catch (error) {
    return next(error);
  }
}

async function crear(req, res, next) {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });
  const { nombre, precio, stock } = req.body;

  try {
    const [resultado] = await pool.execute(
      'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
      [nombre.trim(), precio, stock],
    );
    return res.status(201).json({
      id: resultado.insertId, nombre: nombre.trim(), precio: precio.toFixed(2), stock,
    });
  } catch (error) {
    return next(error);
  }
}

async function actualizar(req, res, next) {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });
  const { nombre, precio, stock } = req.body;
  const id = Number(req.params.id);

  try {
    const [resultado] = await pool.execute(
      'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
      [nombre.trim(), precio, stock, id],
    );
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json({ id, nombre: nombre.trim(), precio: precio.toFixed(2), stock });
  } catch (error) {
    return next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const [resultado] = await pool.execute('DELETE FROM productos WHERE id = ?', [Number(req.params.id)]);
    if (!resultado.affectedRows) return res.status(404).json({ error: 'Producto no encontrado.' });
    return res.json({ mensaje: 'Producto eliminado.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, crear, actualizar, eliminar };
