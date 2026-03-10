import { defineConfig } from "cypress";
import 'dotenv/config';

export default defineConfig({
  e2e: {
    baseUrl: 'https://fufelka.ru',
    viewportWidth: 393,
    viewportHeight: 852,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      config.env.SK_KEY = process.env.SK_KEY;
      return config;
    },
  },
});