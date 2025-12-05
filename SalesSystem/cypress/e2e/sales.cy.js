describe('Sales flow', () => {
  it('navigates to Sales and shows cart', () => {
    cy.visit('http://localhost:5173');
    // Adjust selectors to match your login form if present
    // If app requires login, you can programmatically set localStorage token
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test', role: 'cashier' }));
    });

    // Reload so app picks up localStorage
    cy.reload();

    // Click Sales nav button (ensure text matches)
    cy.contains('Sales').click();

    // Wait for the Sales page elements
    cy.contains('Most Sold Coffees').should('be.visible');
    cy.contains('Cart').should('be.visible');
  });
});
