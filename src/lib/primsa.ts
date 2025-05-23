import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSQLite3({
    url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });
export default prisma;