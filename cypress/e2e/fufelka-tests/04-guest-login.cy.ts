/// <reference types="cypress" />

describe('Сценарий D: Гостевой вход и привязка email (бонус)', () => {
  const timestamp = Date.now();
  const testEmail = `guest${timestamp}@example.com`;

  it('Гостевой вход и привязка email', () => {
    // === 1. Гостевой вход ===
    cy.visit('https://fufelka.ru/', {
      timeout: 60000,
      failOnStatusCode: false,
      onBeforeLoad: (win) => {
        win.localStorage.setItem('sk', Cypress.env('SK_KEY'));
      }
    });

    cy.get('body', { timeout: 30000 }).should('be.visible');
    cy.wait(5000);

    // Перехватить запрос гостевой регистрации
    cy.intercept('POST', '**/auth/register/guest').as('guestRegister');

    // Нажать кнопку "Log In Guest"
    cy.contains('Login as a guest', { timeout: 10000 }).click();

    // Проверить успешность ответа
    cy.wait('@guestRegister', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // Проверить модалку "Welcome to the game!" и закрыть её
    cy.contains('Welcome to the game!', { timeout: 10000 }).should('be.visible');
    cy.contains('Take', { timeout: 10000 }).click();

    // Убедиться, что пользователь на /dashboard/home
    cy.url({ timeout: 10000 }).should('include', '/dashboard/home');
    cy.get('[aria-label="gold-amount-icon"]', { timeout: 10000 }).should('be.visible');

  
    // === 2. Привязка email ===
    // Перейти в Settings (нажать на аватар)
    cy.get('[aria-label="user-avatar"]', { timeout: 10000 }).click();

    // Найти кнопку "Add Email to Account" 
    cy.contains('Add email to your account', { timeout: 10000 }).click();
    // Подтверждение
    cy.contains('Register now', { timeout: 10000 }).click();

    // Перехватить запрос отправки кода подтверждения
    cy.intercept('POST', '**api/auth/register/').as('sendEmailCode'); // уточните эндпоинт

    // Ввести сгенерированный email и pass
    cy.get('input[placeholder="Login"]', { timeout: 10000 }).type(testEmail);
    cy.get('input[placeholder="New password"]', { timeout: 10000 }).type(timestamp.toString());

     cy.contains('Register', { timeout: 10000 }).click();
    // Нажать кнопку запроса 
    cy.contains('Link your email', { timeout: 10000 }).click();

    // Проверить успешность отправки кода
    cy.wait('@sendEmailCode', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // === 3. Проверка ===
    cy.reload();

    // Убедиться, что пользователь остался авторизованным
    cy.url({ timeout: 10000 }).should('include', '/dashboard/home');
    cy.get('[aria-label="gold-amount-icon"]', { timeout: 10000 }).should('be.visible');
  });
});