/// <reference types="cypress" />

describe('Сценарий C: Редактирование профиля', () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  // Генерируем новый никнейм (4-20 символов, латиница+цифры)
  const newNickname = `user${randomPart}`; 

  const testUser = {
    email: `testuser${timestamp}`,
    password: `Pass${randomPart}`
  };

  it('Редактирование профиля и проверка сохранения', () => {
    
    // ===1. Авторизация (регистрация нового пользователя) ===
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

    cy.contains('Take', { timeout: 10000 }).click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard/home');
    cy.get('[aria-label="gold-amount-icon"]', { timeout: 10000 }).should('be.visible');

    
    // === 2. Переход в настройки === 
    cy.get('[aria-label="user-avatar"]', { timeout: 10000 }).click();

    // Убедиться, что страница настроек загружена и отображаются: аватар, имя пользователя, ID пользователя
    cy.get('img[alt="avatar"]', { timeout: 10000 }).should('be.visible');
    cy.get('[aria-label="user-login"]').should('be.visible');
    cy.get('[aria-label="user-id"]').should('be.visible');
 
    
    // === 3. Смена никнейма ===
    // Нажать кнопку редактирования профиля
    cy.get('[aria-label="edit-icon"]', { timeout: 10000 }).click();

     // Перехватить запрос смены никнейма
    cy.intercept('POST', '**api/users/name').as('loadEditProfile');

    // В модалке "Change Nickname" ввести новый никнейм
    cy.contains('Change NickName', { timeout: 10000 }).click();
    cy.get('[aria-label="input-text"]', { timeout: 10000 }).clear().type(newNickname);
    cy.contains('Confirm', { timeout: 10000 }).click();
    

    // Подтверждение
    cy.contains('Confirm', { timeout: 10000 }).click();
    
    // Проверить успешность отправки кода
    cy.wait('@loadEditProfile', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // Проверка, что новый никнейм отображается в шапке
    cy.get('[aria-label="user-login"]', { timeout: 10000 }).should('contain', newNickname);

    // === 4. Сохранение после перезагрузки ===
    cy.reload();

    // Снова проверить никнейм в шапке и на странице настроек
    cy.get('[aria-label="user-login"]', { timeout: 10000 }).should('contain', newNickname);
  });
});