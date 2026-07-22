const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const empleadoRoutes = require("./routes/empleadoRoutes");
const departamentoRoutes = require("./routes/departamentoRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/empleados", empleadoRoutes);
app.use("/api/departamentos", departamentoRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});

sequelize
  .authenticate()
  .then(() =>
    console.log("Conexión a la base de datos establecida correctamente."),
  )
  .catch((err) =>
    console.error("No se pudo conectar a la base de datos:", err.message),
  );
