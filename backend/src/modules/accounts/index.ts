export {
  createAccount,
  getAccount,
  listAccounts,
  getAccountInfo,
  updateAccount,
  deleteAccount,
} from "./controllers/account.controller.js";

export { default as accountRoutes } from "./routes/account.routes.js";

export type { IAccountInfo } from "./schema/types/account.types.js";

export { createAccountSchema } from "./schema/dto/account.dto.js";
