// cypress/support/commands.ts
import "cypress-localstorage-commands";

// ОБЯЗАТЕЛЬНО: объявляем типы ДО реализации команд
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Установка ключа sk и настройка localStorage
       * @example cy.setupSite()
       */
      setupSite(): Chainable<void>;
      
      /**
       * Логин через API
       * @example cy.loginAs('email@test.com', 'password123')
       */
      loginAs(email: string, password: string): Chainable<void>;
    }
  }
}

// Теперь реализуем команды
Cypress.Commands.add('setupSite', () => {
  const skKey = Cypress.env('SK_KEY');
  
  cy.log('🔧 Настройка localStorage...');
  
  // Устанавливаем localStorage
  cy.setLocalStorage('sk', skKey);
  cy.setLocalStorage('i18nextLng', 'en');
  
  // Сохраняем состояние
  cy.saveLocalStorage();
  
  cy.log('✅ localStorage настроен');
});

Cypress.Commands.add('loginAs', (email: string, password: string) => {
  cy.log(`🔑 Попытка входа как: ${email}`);
  
  cy.request({
    method: 'POST',
    url: 'https://fufelka.ru/auth/login',
    body: { email, password },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body?.accessToken) {
      cy.setLocalStorage('accessToken', response.body.accessToken);
      cy.saveLocalStorage();
      cy.log('✅ Вход выполнен успешно');
    }
  });
});

