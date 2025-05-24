
/* This setup is for SQLite DEV only */
// import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
// import { PrismaClient } from "@prisma/client";

// const adapter = new PrismaBetterSQLite3({
//     url: "file:./prisma/dev.db",
// });
// const prisma = new PrismaClient({ adapter });
// export default prisma;

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;
