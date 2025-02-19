# FinTrack API Documentation

Welcome to the FinTrack API documentation. This guide provides detailed information on how to interact with the FinTrack API, which allows you to manage users, categories, transactions, budgets, and analytics.

## Table of Contents
1. [Users](#users)
   - [User Register](#user-register)
   - [User Login](#user-login)
   - [User Profile](#user-profile)
2. [Categories](#categories)
   - [Create a Category](#create-a-category)
   - [Retrieve Categories](#retrieve-categories)
   - [Update a Category](#update-a-category)
   - [Delete a Category](#delete-a-category)
3. [Transactions](#transactions)
   - [Create a Transaction](#create-a-transaction)
   - [Retrieve Transactions](#retrieve-transactions)
   - [Update a Transaction](#update-a-transaction)
   - [Delete a Transaction](#delete-a-transaction)
4. [Budgets](#budgets)
   - [Create a Budget](#create-a-budget)
   - [Retrieve Budgets](#retrieve-budgets)
   - [Update a Budget](#update-a-budget)
5. [Analytics](#analytics)
   - [30 Days Analytics](#30-days-analytics)
   - [90 Days Analytics](#90-days-analytics)
   - [Year Analytics](#year-analytics)
6. [Test](#test)

## Users

### User Register
Register a new user.

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Body:**
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com", 
  "password": "password123" 
}
```

### User Login
Login an existing user.

**Endpoint:** `POST http://localhost:5000/api/user/login/`

**Body:**
```json
{
  "email": "testuser@gmial.com", 
  "password": "Password123" 
}
```

### User Profile
Retrieve the profile of the logged-in user.

**Endpoint:** `GET http://localhost:5000/api/users/profile`

**Authorization:** Bearer Token

**Token:** `<token>`

## Categories

### Create a Category
Create a new category.

**Endpoint:** `POST http://localhost:5000/api/categories/`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
    "name": "Drink",
    "icon": "🍸",
    "color": "#00FF00"
}
```

### Retrieve Categories
Retrieve all categories.

**Endpoint:** `GET http://localhost:5000/api/categories/`

**Authorization:** Bearer Token

**Token:** `<token>`

### Update a Category
Update an existing category.

**Endpoint:** `PUT http://localhost:5000/api/categories/67b1dc5450c9bf327c120d25`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
    "name": "Chinese Food",
    "icon": "🍕",
    "color": "#00FF00"
}
```

### Delete a Category
Delete a category.

**Endpoint:** `DELETE http://localhost:5000/api/categories/67b1dc5450c9bf327c120d25`

**Authorization:** Bearer Token

**Token:** `<token>`

## Transactions

### Create a Transaction
Create a new transaction.

**Endpoint:** `POST http://localhost:5000/api/transactions/`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
  "date": "2025-02-05",
  "description": "Monthly Salary",
  "category": "Income",
  "type": "Income",
  "amount": 12000
}
```

### Retrieve Transactions
Retrieve all transactions.

**Endpoint:** `GET http://localhost:5000/api/transactions/`

**Authorization:** Bearer Token

**Token:** `<token>`

### Update a Transaction
Update an existing transaction.

**Endpoint:** `PUT http://localhost:5000/api/transactions/67b1e06450c9bf327c120d3c`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
  "date": "2024-08-01",
  "description": "Shipping",
  "amount": 2000,
  "categoryId": "67b1dfd150c9bf327c120d36", 
  "type": "expense"
}
```

### Delete a Transaction
Delete a transaction.

**Endpoint:** `DELETE http://localhost:5000/api/transactions/67b1e06450c9bf327c120d3c`

**Authorization:** Bearer Token

**Token:** `<token>`

## Budgets

### Create a Budget
Create a new budget.

**Endpoint:** `POST http://localhost:5000/api/budgets/`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
  "category": "Food",
  "limit": 500
}
```

### Retrieve Budgets
Retrieve all budgets.

**Endpoint:** `GET http://localhost:5000/api/budgets/`

**Authorization:** Bearer Token

**Token:** `<token>`

### Update a Budget
Update an existing budget.

**Endpoint:** `PUT http://localhost:5000/api/budgets/67b1e7f22d15c963d33f4f01`

**Authorization:** Bearer Token

**Token:** `<token>`

**Body:**
```json
{
  "categoryId": "67b1dbb650c9bf327c120d21",
  "amountLimit": 5000,
  "startDate": "2024-08-01",
  "endDate": "2024-08-31"
}
```

## Analytics

### 30 Days Analytics
Retrieve analytics for the last 30 days.

**Endpoint:** `GET http://localhost:5000/api/analytics/30days`

**Authorization:** Bearer Token

**Token:** `<token>`

### 90 Days Analytics
Retrieve analytics for the last 90 days.

**Endpoint:** `GET http://localhost:5000/api/analytics/90days`

**Authorization:** Bearer Token

**Token:** `<token>`

### Year Analytics
Retrieve analytics for the current year.

**Endpoint:** `GET http://localhost:5000/api/analytics/current-year`

**Authorization:** Bearer Token

**Token:** `<token>`

## Test

### Test
Test endpoint.

**Endpoint:** `GET http://localhost:5000/api/test`

---

For any issues or further assistance, please contact the support team.
