/// <reference types="cypress" />

describe('Сценарий B: Создание клуба и навигация', () => {
  const timestamp = Date.now();
  // Генерируем случайную часть для пароля 
  const randomPart = Math.random().toString(36).substring(2, 10);
  const testUser = {
    email: `testuser${randomPart}`,
    password: `Pass${randomPart}` 
  };

  it('Создание клуба и навигация по вкладкам', () => {
    
    // === 1. Регистрация нового пользователя  ===
    cy.visit('https://fufelka.ru/', {
      timeout: 60000,
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        win.localStorage.setItem('sk', Cypress.env('SK_KEY'));
      }
    });

    cy.get('body', { timeout: 30000 }).should('be.visible');
    cy.wait(5000);

    cy.intercept('POST', '**/auth/register/**').as('registerRequest');

    cy.contains('Sign up', { timeout: 30000 }).click();
    cy.get('[aria-label="input-email"]', { timeout: 10000 }).type(testUser.email);
    cy.get('[aria-label="input-password"]', { timeout: 10000 }).type(testUser.password);
    cy.contains('Sign up', { timeout: 10000 }).click();

    cy.wait('@registerRequest', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
    cy.contains('Take', { timeout: 10000 }).click();
   
    
    // === 2.Создание клуба ===
    // Переход на страницу клубов через нижнюю навигацию
    cy.get('[aria-label="nav-item-club"]', { timeout: 10000 }).click();
    cy.url().should('include', '/dashboard/club');

    // Нажать кнопку "Create Club"
    cy.get('[class*="button-createClub"]', { timeout: 10000 }).click();
    
    // Перехватить запрос создания клуба
    cy.intercept('POST', '**api/clubs').as('createClub');
    
    // подтверждение на создание
    cy.contains('Create a club', { timeout: 10000 }).click();
    
    // проверка создания модалки The club has been successfully created!
    cy.contains('The club has been successfully created!', { timeout: 10000 }).should('be.visible');

    // Подтвердить создание в модалке 
    cy.contains('Confirm', { timeout: 10000 }).click();

    // Проверить успешность отправки кода
    cy.wait('@createClub', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // Перехватить запрос вход в клуб
    cy.intercept('GET', '**api/club').as('getClub');
    
    
    // === 3. Вход в созданный клуб и проверка дашборда ===
    // Проверить что клуб создан и отображается в списке, кликнуть на него.
    cy.get('[aria-label="club-name-btn"]', { timeout: 10000 }).click();
    
    // Проверить успешность отправки кода
    cy.wait('@getClub', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
    
    // Проверить приветствие клуба (Welcome!)
    cy.get('[aria-label="club-greetings-wrapper"]', { timeout: 10000 }).should('be.visible');
    
    // Проверить сетку игр 
    cy.get('[class*="gameListWrapper"]', { timeout: 10000 }).should('be.visible');

   
    // === 4. Навигация по вкладкам ===
    // Переключиться на Members
    cy.get('[aria-label="nav-item-members"]', { timeout: 10000 }).click();
    
    // Проверка что страница участников загружена
    cy.contains("There isn't member", { timeout: 10000 }).should('be.visible');


    // Переключиться на Chat
    cy.get('[aria-label="nav-item-chat"]', { timeout: 10000 }).click();
    // убедиться, что чат клуба отображается
    cy.contains("Club chat", { timeout: 10000 }).should('be.visible');
    cy.get('[aria-label="arrow-left-icon"]', { timeout: 20000 }).click();

    // Переключиться на Cashier
    cy.get('[aria-label="nav-item-cashier"]', { timeout: 10000 }).click();
    // убедиться, что раздел кассы виден.
    cy.contains("Club cashier", { timeout: 10000 }).should('be.visible');

    // Вернуться на Home 
    cy.get('[aria-label="nav-item-home"]', { timeout: 10000 }).click();
  });
});