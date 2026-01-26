// import { routes } from './app';
// import config from './config/config';

// // ────────────────────────────────────────────────
// // Terminal colors
// // ────────────────────────────────────────────────
// const GREEN = '\x1b[32m';
// const BLUE = '\x1b[34m';
// const YELLOW = '\x1b[33m';
// const WHITE = '\x1b[37m';
// const RESET = '\x1b[0m';

// // Helper: formatted date
// const getFormattedDate = () => {
//   const now = new Date();
//   return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
// };

// // Helper: formatted time
// const getFormattedTime = () => {
//   const now = new Date();
//   return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
// };

// // ────────────────────────────────────────────────
// // Log routes grouped by module
// // ────────────────────────────────────────────────
// function logRoutesByModule() {
//   const grouped: Record<string, any[]> = {};

//   routes.forEach((route) => {
//     if (!grouped[route.module]) grouped[route.module] = [];
//     grouped[route.module].push(route);
//   });

//   Object.entries(grouped).forEach(([module, routeList]) => {
//     console.log(
//       `${YELLOW}======================= ${module.toUpperCase()} =======================${RESET}\n`
//     );

//     routeList.forEach((route: any) => {
//       const info = `${GREEN}${route.method} ${route.path} - ${YELLOW}${route.time.toFixed(2)} ms${RESET}`;
//       console.log(
//         `${GREEN}[Express] ${WHITE}${getFormattedDate()} ${getFormattedTime()} ${GREEN}LOG ${YELLOW}[RouterExplorer] ${info}${RESET}`
//       );
//     });

//     console.log(`\n${YELLOW}======================== END ========================${RESET}\n`);
//   });
// }

// // ────────────────────────────────────────────────
// // Connect to MongoDB and start the server
// // ────────────────────────────────────────────────

// async function startServer() {
//   try {
//     console.log(config.DB_CONNECTION_URI);
//     // await mongoose.connect(config.DB_CONNECTION_URI);
//     console.log(
//       `${GREEN}✔${RESET} ${WHITE}Connected to MongoDB successfully.${RESET} \n`,
//       `Base URL: ${YELLOW}${config.BASE_URL}:${config.PORT}${RESET} \n`,
//       `Environment: ${YELLOW}${config.NODE_ENV}${RESET} \n`,
//       `Port: ${YELLOW}${config.PORT}${RESET} \n`
//     );
//     logRoutesByModule();
//   } catch (error: any) {
//     console.error(`${YELLOW}⚠${RESET} ${WHITE}Failed to connect to MongoDB:${RESET}`, error);
//     process.exit(1);
//   }
// }

// startServer();
