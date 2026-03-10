/// <reference types="cypress" />

describe('Сценарий A: Регистрация', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `testuser${timestamp}`,
     password: `Pass${timestamp.toString().slice(-8)}`
  };

  beforeEach(() => {
    
    // Открываем страницу и устанавливаем localStorage
    cy.visit('https://fufelka.ru/', {
      timeout: 60000,
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        win.localStorage.setItem('sk', Cypress.env('SK_KEY'));
        
      }
    });

    // Проверяем загрузку
    cy.get('body', { timeout: 30000 }).should('be.visible');
    cy.wait(5000);
    
    //Перехватили POST /auth/register/
    cy.intercept('POST', '**/auth/register/**').as('registerRequest');
  });

  it('Регистрация нового пользователя', () => {
    // === 1. Регистрация нового пользователя  ===
    // Проверяем localStorage
    cy.getAllLocalStorage().then((result) => {
      expect(result['https://fufelka.ru']).to.have.property('sk');
    });

    // Нажимаем Sign up
    cy.contains('Sign up', { timeout: 30000 }).click();
    
    // вводим логин и пасс
    cy.get('[aria-label="input-email"]', { timeout: 10000 }).type(testUser.email);
    cy.get('[aria-label="input-password"]', { timeout: 10000 }).type(testUser.password);
    cy.contains('Sign up', { timeout: 10000 }).click();
    
    // Проверить успешность отправки кода
    cy.wait('@registerRequest').its('response.statusCode').should('eq', 200);
    
    
    // === 2. Приветственный бонус  ===
    //проверяем модалку «Welcome to the game!»
    cy.contains('Welcome to the game!', { timeout: 10000 }).should('be.visible');
    cy.contains('Take', { timeout: 10000 }).click();
    
    // === 3. Проверка бонуса в балансе  ===
    //проверка после закрытия модалки попадаем на /dashboard/home
    cy.url({ timeout: 10000 }).should('include', '/dashboard/home');
    
    //проверка в шапке баланса
    cy.get('[aria-label="gold-amount-icon"]', { timeout: 10000 }).should('be.visible');
    
    // === 4. Сохранение сессии  ===
    //перезагрузка страницы, проверка что пользователь остаётся авторизованным
    cy.reload();
    cy.url({ timeout: 10000 }).should('include', '/dashboard/home');
  });
});