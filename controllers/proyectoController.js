const Proyecto = require("../models/Proyecto");
const { validationResult } = require("express-validator");

exports.crearProyecto = async (req, res) => {
  //revisar si hay errores
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    //crear un nuevo proyecto
    const proyecto = new Proyecto(req.body);

    //guardar el creador via jwt
    proyecto.creador = req.usuario.id;

    //guardamos el proyecto
    proyecto.save();
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" });
  }
};

//obtener los proyectos del usuario actual
exports.obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ creador: req.usuario.id }).sort({
      creado: -1,
    });
    res.json({ proyectos: proyectos });
  } catch (error) {
    //console.log(error);
    res.status(500).json({ msg: "Hubo un error" });
  }
};

//actualiza un proyecto
exports.actualizarProyecto = async (req, res) => {
  //revisar si hay errores
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  try {
    const { nombre } = req.body;
    const nuevoProyecto = {};
    if (nombre) {
      nuevoProyecto.nombre = nombre;
    }

    //revisar el id
    let proyecto = await Proyecto.findById(req.params.id);

    //revisar si el proyecto existe
    if (!proyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //verificar el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //actualizar
    proyecto = await Proyecto.findOneAndUpdate(
      { _id: req.params.id },
      { $set: nuevoProyecto },
      { new: true }
    );

    res.json({ proyecto });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" });
  }
};

//eliminar un proyecto
exports.eliminarProyecto = async (req, res) => {
  try {
    //revisar el id
    let proyecto = await Proyecto.findById(req.params.id);

    //revisar si el proyecto existe
    if (!proyecto) {
      return res.status(404).json({ msg: "Proyecto no encontrado" });
    }

    //verificar el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario.id) {
      return res.status(401).json({ msg: "No autorizado" });
    }

    //eliminar el proyecto
    await Proyecto.findOneAndRemove({ _id: req.params.id });
    res.json({ msg: "Proyecto eliminado" });
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" });
  }
};
