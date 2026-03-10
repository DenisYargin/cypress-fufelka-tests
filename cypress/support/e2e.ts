// cypress/support/e2e.ts
import './commands';
import 'cypress-localstorage-commands';

// Восстанавливаем localStorage перед каждым тестом
beforeEach(() => {
  cy.restoreLocalStorage();
});

// Сохраняем localStorage после каждого теста
afterEach(() => {
  cy.saveLocalStorage();
});