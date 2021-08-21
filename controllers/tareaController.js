const Tarea = require("../models/Tarea");
const Proyecto = require("../models/Proyecto");
const { validationResult } = require("express-validator");

//crea una nueva tarea
exports.crearTarea = async (req, res) => {
  //revisar si hay errores
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //extraer el proyecto
  try {
    const { proyecto } = req.body;

    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const tarea = new Tarea(req.body);
    await tarea.save();
    res.json({ tarea });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" + error });
  }
};

//obtener las tareas por proyecto
exports.obtenerTareas = async (req, res) => {
  try {
    const { proyecto } = req.query;

    const existeProyecto = await Proyecto.findById(proyecto);
    if (!existeProyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    const tareas = await Tarea.find({ proyecto: proyecto }).sort({
      creado: -1,
    });
    res.json({ tareas });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" + error });
  }
};

//actualizar una tarea
exports.actualizarTarea = async (req, res) => {
  try {
    const { proyecto, nombre, estado } = req.body;

    //si la tarea existe
    let existeTarea = await Tarea.findById(req.params.id);

    if (!existeTarea) {
      return res.status(404).json({ msg: "Tarea no encontrada" });
    }

    const existeProyecto = await Proyecto.findById(proyecto);

    //revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //crear un objeto con la nueva informacion
    const nuevaTarea = {};

    nuevaTarea.nombre = nombre;

    nuevaTarea.estado = estado;

    existeTarea = await Tarea.findOneAndUpdate(
      { _id: req.params.id },
      nuevaTarea,
      { new: true }
    );

    res.json({ existeTarea });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" + error });
  }
};

exports.eliminarTarea = async (req, res) => {
  try {
    const { proyecto } = req.query;

    //si la tarea existe
    let existeTarea = await Tarea.findById(req.params.id);

    if (!existeTarea) {
      return res.status(404).json({ msg: "Tarea no encontrada" });
    }

    const existeProyecto = await Proyecto.findById(proyecto);

    //revisar si el proyecto actual pertenece al usuario autenticado
    if (existeProyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //eliminar
    await Tarea.findOneAndRemove({ _id: req.params.id });
    res.json({ msg: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" + error });
  }
};
