##### Authentication API Documentation

## Register User

Create a new user account with optional profile picture upload and email verification.

### Endpoint

```http
POST /api/auth/register
```

### Base URL

```http
http://localhost:5000
```

### Full URL

```http
http://localhost:5000/api/auth/register
```

---

# Request

## Content Type

```http
multipart/form-data
```

---

## Request Body Parameters

| Field         | Type   | Required | Description |
|----------------|--------|----------|-------------|
| username       | string | Yes | User's username |
| email          | string | Yes | User's email address |
| phone          | string | No | User's phone number |
| password       | string | Yes | User password |
| address        | string | No | User address |
| city           | string | Yes | User city |
| state          | string | Yes | User state |
| profile_pic    | file   | No | Profile image file (Max 2MB) |

---

## Validation Rules

### Required Fields

The following fields are required:

- username
- email
- password
- city
- state

### Profile Picture Rules

- Only image files are allowed
- Maximum file size: 2MB

Supported image MIME types:

- image/png
- image/jpeg
- image/jpg
- image/webp
- image/gif

---

# Features

- Password hashing using bcrypt
- Duplicate email prevention
- Cloudinary profile picture upload
- Email verification token generation
- Verification email sending
- Redis queue support using BullMQ

---

# Success Response

## Status Code

```http
201 Created
```

## Response Body

```json
{
    "message": "user created successfully",
    "user": {
        "id": "6975f6a6f235615d1c32f233",
        "username": "showqi",
        "email": "showqi12@gmail.com"
    }
}
```

---

# Error Responses

## Missing Required Fields

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "required fields missing"
}
```

---

## Duplicate Email

### Status Code

```http
409 Conflict
```

### Response

```json
{
    "message": "email already registered"
}
```

---

## Invalid File Type

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "only image files allowed"
}
```

---

## File Too Large

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "File too large"
}
```

---

## Internal Server Error

### Status Code

```http
500 Internal Server Error
```

### Response

```json
{
    "message": "server error"
}
```

---

# Email Verification

After successful registration:

1. A verification token is generated
2. Verification email is sent to the user's email address
3. User must verify email before account activation

### Verification Link Format

```http
http://localhost:5000/api/auth/verify-email/:token
```

Example:

```http
http://localhost:5000/api/auth/verify-email/4fd8c2ab8f2d4f7c8b9d6e2a1c4f8d9
```

---

# Example Request Using Postman

## Method

```http
POST
```

## URL

```http
http://localhost:5000/api/auth/register
```

## Body Type

```http
form-data
```

## Form Data

| Key          | Value              | Type |
|--------------|-------------------|------|
| username     | showqi            | Text |
| email        | showqi12@gmail.com | Text |
| phone        | 01700000000       | Text |
| password     | 12345678          | Text |
| address      | Dhaka             | Text |
| city         | Dhaka             | Text |
| state        | Bangladesh        | Text |
| profile_pic  | image.png         | File |

---

# Technology Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Cloudinary
- bcrypt
- BullMQ
- Redis
- Nodemailer

---

# Notes

- Passwords are securely hashed before saving
- Email must be unique
- Profile picture upload is optional
- Uploaded images are stored in Cloudinary
- Verification token expires after 15 minutes
- Redis is used for background email queue processing


------------------------------------------------------------------------



````markdown id="verify-email-api-doc"
# Verify Email API Documentation

## Verify User Email

Verify a user's email address using the verification token sent to their email during registration.

### Endpoint

```http
GET /api/auth/verify-email/:token
```

---

# Base URL

```http
http://localhost:5000
```

---

# Full URL Example

```http
http://localhost:5000/api/auth/verify-email/fafb866668ca365f2d7127c14fa7599de8c89b58ee5cead3
```

---

# Request

## Method

```http
GET
```

---

## URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Email verification token |

---

# Functionality

This endpoint performs the following actions:

1. Checks whether the verification token exists
2. Validates token expiration time
3. Activates the user account
4. Removes verification token data
5. Redirects user to frontend verification page

---

# Success Response

## Status Code

```http
200 OK
```

## Response Body

```json
{
    "message": "Account verified successfully"
}
```

---

# Frontend Redirect

After successful verification, the user is redirected to:

```http
http://localhost:5173/verify/users?status=success
```

---

# Error Responses

## Invalid or Expired Token

### Status Code

```http
400 Bad Request
```

### Response Body

```json
{
    "message": "Invalid or expired token"
}
```

---

# Failed Verification Redirect

If verification fails due to server error, the user is redirected to:

```http
http://localhost:5173/verify/users/status=error
```

---

# Database Changes After Verification

## Updated User Fields

| Field | Previous Value | New Value |
|-------|----------------|----------|
| isActive | false | true |
| emailVerifyToken | token value | undefined |
| emailVerifyExpires | timestamp | undefined |

---

# Example Flow

## Step 1: User Registers

User registers using:

```http
POST /api/auth/register
```

---

## Step 2: Verification Email Sent

A verification link is sent to the user's email.

Example:

```http
http://localhost:5000/api/auth/verify-email/fafb866668ca365f2d7127c14fa7599de8c89b58ee5cead3
```

---

## Step 3: User Clicks Verification Link

Backend verifies the token and activates the account.

---

## Step 4: Frontend Redirect

User is redirected to:

```http
http://localhost:5173/verify/users?status=success
```

---

# Route Configuration

## Route

```js
router.get("/verify-email/:token", verifyEmail);
```

---

## Main App

```js
app.use("/api/auth", authRoutes);
```

---

# Security Notes

- Verification tokens are time-limited
- Expired tokens are rejected
- Token is removed after successful verification
- User account remains inactive until email verification is completed

---

# Related APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| GET | /api/auth/verify-email/:token | Verify user email |

````

-------------------------------------------------------------------------------------------

# Login API Documentation

## Login User

Authenticate a registered user and return a JWT access token.

### Endpoint

```http
POST /api/auth/login
```

---

# Base URL

```http
http://localhost:5000
```

---

# Full URL

```http
http://localhost:5000/api/auth/login
```

---

# Request

## Content Type

```http
application/json
```

---

## Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Registered user email |
| password | string | Yes | User password |

---

# Example Request

```json
{
    "email": "showqi12@gmail.com",
    "password": "12345678"
}
```

---

# Authentication Flow

The login system performs the following checks:

1. Validates email and password fields
2. Checks whether user exists
3. Verifies whether email is activated
4. Checks account lock status
5. Verifies password using bcrypt
6. Generates JWT token on successful login

---

# Success Response

## Status Code

```http
200 OK
```

## Response Body

```json
{
    "message": "Login successfull",
    "token": "your_jwt_token_here",
    "user": {
        "_id": "6975f6a6f235615d1c32f233",
        "username": "showqi",
        "email": "showqi12@gmail.com",
        "role": "user",
        "isActive": true
    }
}
```

---

# Error Responses

## Missing Email

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "please, must provide an email"
}
```

---

## Missing Password

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "please, must provide a password"
}
```

---

## User Not Found

### Status Code

```http
404 Not Found
```

### Response

```json
{
    "message": "user with this email does not exist"
}
```

---

## Email Not Verified

### Status Code

```http
403 Forbidden
```

### Response

```json
{
    "message": "please verify your email first. A verifiation email has been sent to your email address!!"
}
```

---

## Invalid Credentials

### Status Code

```http
400 Bad Request
```

### Response

```json
{
    "message": "Invalid credentials"
}
```

---

# Account Lock System

The API includes login attempt protection.

## Rules

- Maximum failed attempts: 3
- Lock duration: 2 minutes

---

## Account Locked Response

### Status Code

```http
429 Too Many Requests
```

### Response

```json
{
    "message": "Too many attempts. Account locked for 2 minutes"
}
```

---

## Locked Account Retry Response

### Status Code

```http
429 Too Many Requests
```

### Response

```json
{
    "message": "Too many attempts. Try again in 2 minute(s)"
}
```

---

# JWT Authentication

## Token Generation

A JWT token is generated after successful authentication.

### Token Payload

```json
{
    "id": "user_id",
    "role": "user_role"
}
```

---

## JWT Expiration

The token expiration time is controlled by:

```env
JWT_EXPIRES_IN
```

Example:

```env
JWT_EXPIRES_IN=7d
```

---

# Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Login attempt tracking
- Temporary account lock system
- Email verification required before login

---

# Route Configuration

## Route

```js
router.post("/login", loginUser);
```

---

## Main App

```js
app.use("/api/auth", authRoutes);
```

---

# Example Using Postman

## Method

```http
POST
```

---

## URL

```http
http://localhost:5000/api/auth/login
```

---

## Headers

| Key | Value |
|-----|------|
| Content-Type | application/json |

---

## Body

```json
{
    "email": "showqi12@gmail.com",
    "password": "12345678"
}
```

---

# Related APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| GET | /api/auth/verify-email/:token | Verify user email |
| POST | /api/auth/login | Login user |

