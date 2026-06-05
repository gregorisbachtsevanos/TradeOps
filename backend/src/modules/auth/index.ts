export { register, login, me } from "./controllers/auth.controller.js";

export { default as authRoutes } from "./routes/auth.routes.js";

export { loginSchema, registerSchema } from "./dto/auth.dto.js";
