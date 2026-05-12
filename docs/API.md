# 🔐 Authentication API

## Register User
`POST` **`/api/auth/register`**

Register a new user account with integrated profile image upload, secure password hashing, and automated email verification.

---

### 🛠️ Technical Stack
*   **Storage:** Images are processed via **Multer** (middleware) and hosted on **Cloudinary**.
*   **Security:** High-entropy password hashing using **bcrypt**.
*   **Background Tasks:** Verification emails are handled via an asynchronous **Worker Queue** to ensure zero latency for the user.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/register` |
| **Content-Type** | `multipart/form-data` |

---

### 📥 Request Body
> **Note:** Use `form-data` in your request client (like Postman or Insomnia).

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `username` | `string` | ✅ | Unique user identifier |
| `email` | `string` | ✅ | Primary contact & login email |
| `password` | `string` | ✅ | Account password |
| `city` | `string` | ✅ | User's current city |
| `state` | `string` | ✅ | User's state or country |
| `phone` | `string` | ❌ | Contact phone number |
| `address` | `string` | ❌ | Residential address |
| `profile_pic` | `file` | ❌ | Image file (jpg/png) |

---

### 📤 Response Example
**Success (201 Created)**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "6641cd89...",
    "profile_url": "[https://res.cloudinary.com/](https://res.cloudinary.com/)..."
  }
}



# Verify Email API

## Endpoint
```http
GET /api/verify-email/:token
```

---

# Description
This endpoint verifies a user's email address using a verification token sent to their email.

If the token is valid and not expired:
- The user's account is activated
- Verification token is removed
- User is redirected to success page

If the token is invalid or expired:
- User receives an error response or is redirected to error page

---

# Request Parameters

| Parameter | Type   | Description |
|----------|--------|-------------|
| token | string | Email verification token |

---

# Success Response

## Status Code
```http
302 Found
```

## Redirect URL
```http
http://localhost:5173/verify/users?status=success
```

---

# Error Response

## Status Code
```http
400 Bad Request
```

## Response Body
```json
{
  "message": "Invalid or expired token"
}
```

---

# Server Error Redirect

## Redirect URL
```http
http://localhost:5173/verify/users/status=error
```

---

# Example Request

```http
GET http://localhost:5000/api/verify-email/abc123token
```

---

# Example Workflow

1. User registers account
2. Server sends verification email
3. User clicks verification link
4. Backend validates token
5. Account becomes active
6. User redirected to success page
7. If token is invalid/expired, user receives error message or is redirected to error page



# 📧 Verify Email API

## Verify Account
`GET` **`/api/verify-email/:token`**

Validates the security token sent to the user's email to activate their account and grant access to protected features.

---

### 🛠️ Workflow Logic
1.  **Extraction:** The server captures the `:token` from the URL parameter.
2.  **Validation:** Checks database for a matching, non-expired token.
3.  **Activation:** Upon success, the user's `isVerified` status is set to `true` and the token is revoked.
4.  **Redirection:** The server issues a `302` redirect to the frontend status page.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/verify-email/:token` |
| **Method** | `GET` |

---

### 📥 Path Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `token` | `string` | ✅ | Unique verification string sent via email |

---

### 🔄 Redirect Behaviors
| Scenario | Status Code | Redirect Destination |
| :--- | :--- | :--- |
| **Success** | `302 Found` | `http://localhost:5173/verify/users?status=success` |
| **Expired/Invalid** | `400 Bad Request` | `http://localhost:5173/verify/users?status=error` |

---

### 📤 Error Response (Body)
*If the request fails without a redirect (e.g., API testing):*

```json
{
  "success": false,
  "message": "Invalid or expired token"
}

```

# 🔑 Login API

## User Login
`POST` **`/api/auth/login`**

Authenticates a user and returns a JSON Web Token (JWT). Includes security features such as account locking after multiple failed attempts and email verification checks.

---

### 🛡️ Security Features
*   **Account Locking:** After **3 failed attempts**, the account is automatically locked for **2 minutes**.
*   **Verification Check:** Users cannot login unless `isActive` is `true`.
*   **Credential Protection:** Passwords are compared using **bcrypt** and stripped from the final JSON response.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/login` |
| **Content-Type** | `application/json` |

---

### 📥 Request Body
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | ✅ | Registered user email |
| `password` | `string` | ✅ | Account password |

---

### 📤 Success Response
**Status: `200 OK`**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "_id": "64f1a2...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### ❌ Error Responses

Detailed list of possible error states handled by the login controller:

| Status Code | Message | Scenario |
| :--- | :--- | :--- |
| **400 Bad Request** | `"please, must provide an email"` | The `email` field is missing from the request body. |
| **400 Bad Request** | `"please, must provide a password"` | The `password` field is missing from the request body. |
| **400 Bad Request** | `"Invalid credentials"` | Password comparison failed or incorrect credentials provided. |
| **403 Forbidden** | `"please verify your email first..."` | Account exists but `isActive` is false (Email not verified). |
| **404 Not Found** | `"user with this email does not exist"` | No record matches the provided email address. |
| **429 Too Many Requests** | `"Too many attempts. Try again in X minute(s)"` | Account is temporarily locked due to 3+ failed attempts. |
| **500 Internal Error** | `"Server error"` | An unexpected error occurred on the server side. |

---

### 🛡️ Brute Force Protection Logic
The API implements a sliding window lockout to prevent automated attacks:

1. **Attempt Tracking:** Each failed `bcrypt` comparison increments the `loginAttempts` counter.
2. **Threshold:** Upon the **3rd failed attempt**, the `lockUntil` timestamp is set.
3. **Cool-down:** The account remains inaccessible for **2 minutes**.
4. **Reset:** A successful login clears both `loginAttempts` and `lockUntil` values.




# 🔑 Forgot Password API

## Request Password Reset
`POST` **`/api/auth/forget-password`**

Initiates the password recovery process by generating a secure, hashed reset token and sending a unique recovery link to the user's registered email.

---

### 🛠️ Workflow Logic
1.  **Verification:** Checks if the provided email exists in the database.
2.  **Token Generation:** Creates a cryptographically secure 32-byte random string (unhashed).
3.  **Hashing:** Hashes the token using `SHA-256` before saving it to the database for security.
4.  **Expiration:** Sets a strict **15-minute** validity window for the token.
5.  **Communication:** Dispatches an email containing the unhashed token in a clickable URL.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/forget-password` |
| **Content-Type** | `application/json` |

---

### 📥 Request Body
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | ✅ | The registered email address of the user |

---

### 📤 Success Response
**Status: `200 OK`**
```json
{
  "message": "password reset link hasbeen sent to this email !!!"
}
```

### ❌ Error Responses

Detailed list of possible error states handled by the **Forgot Password** controller:

| Status Code | Message | Scenario |
| :--- | :--- | :--- |
| **400 Bad Request** | `"must provide an email"` | The `email` field is missing or empty in the request body. |
| **404 Not Found** | `"user with this email do not exists"` | The provided email is not registered in the database. |
| **500 Internal Error** | `"Server error"` | An unexpected failure occurred (e.g., Database down or Email Service failure). |

---

### 🛡️ Security Protocol
To protect user accounts, the system follows these security measures during the reset request:

*   **Cryptographic Hashing:** The `resetToken` is hashed using the **SHA-256** algorithm before being stored in the database.
*   **Time-Limited Access:** The link remains valid for exactly **15 minutes**. After this period, the `resetPasswordExpires` timestamp will cause the server to reject the token.
*   **Database Cleanup:** Upon a successful password change (in the next step of the API), these temporary fields should be cleared to prevent token reuse.


# 🔄 Reset Password API

## Update Password
`POST` **`/api/auth/reset-password/:token`**

Finalizes the password recovery process by validating the reset token and updating the user's password in the database.

---

### 🛠️ Execution Logic
1.  **Token Hashing:** The plain-text token from the URL is hashed using `SHA-256` to match the stored version.
2.  **User Verification:** The system searches for a user where the hashed token matches **and** the expiration time is in the future (`$gt: Date.now()`).
3.  **Password Update:** The new password is encrypted using **bcrypt** (salt rounds: 12).
4.  **Cleanup:** The `resetPasswordToken` and `resetPasswordExpires` fields are set to `undefined` to ensure the token cannot be used a second time.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/reset-password/:token` |
| **Method** | `POST` |

---

### 📥 Request Details
**Path Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `token` | `string` | ✅ | The plain-text reset token from the email link. |

**Body Parameters (JSON)**
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `password` | `string` | ✅ | The new password for the account. |

---

### 📤 Success Response
**Status: `200 OK`**
```json
{
  "message": "password resete successfully"
}
```

### ❌ Error Responses

Detailed list of possible error states handled by the **Reset Password** controller:

| Status Code | Message | Scenario |
| :--- | :--- | :--- |
| **200 OK** | `"token is missing"` | The `:token` URL parameter is absent or malformed. |
| **200 OK** | `"please provide a password"` | The `password` field was not found in the request body. |
| **404 Not Found** | `"token expired or invalid"` | The token is incorrect or the 15-minute validity window has lapsed. |
| **500 Internal Error** | `(Dynamic Error Message)` | Server-side failure during password hashing or database saving. |

---

### 🛡️ Security & Validation Logic
To ensure the integrity of the password update process, the following checks are performed:

1. **Hash Verification:** The incoming plain-text token is immediately converted to a **SHA-256 hash**. This is then compared against the `resetPasswordToken` stored in the database.
2. **Temporal Validation:** The query uses the `$gt` (Greater Than) operator to ensure `resetPasswordExpires` is still in the future compared to the current server time.
3. **Atomic Revocation:** Once the password is successfully updated, the `resetPasswordToken` and `resetPasswordExpires` fields are purged (`undefined`). This renders the link useless for any future attempts, preventing unauthorized reuse.


# 📨 Admin/Staff Invitation API

## Generate Invitation
`POST` **`/api/auth/admin-staff-invite`**

Initiates a privileged account invitation. If the user already exists, their role is updated; if not, a secure invitation token is generated and emailed to them.

---

### 🛠️ Execution Logic
1.  **Identity Check:** Searches the database for an existing user with the provided email.
2.  **Instant Upgrade:** If the user exists, the system immediately updates their `role` to the one provided in the request.
3.  **Token Generation:** If the user is new, a 32-byte secure `invite_token` is created.
4.  **Audit Trail:** The system records who sent the invite (`sender`) and their role (`sender_role`) for security tracking.
5.  **Expiration:** Tokens are set to expire in **1 hour** (60 minutes).
6.  **Background Processing:** The invitation email is pushed to an `emailQueue` with a retry policy (3 attempts, 5s backoff) to ensure delivery.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/admin-staff-invite` |
| **Authorization** | `Bearer <JWT_TOKEN>` (Admin Only) |
| **Content-Type** | `application/json` |

---

### 📥 Request Body
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `string` | ✅ | The email address of the invitee. |
| `role` | `string` | ✅ | The role to assign (e.g., `admin`, `staff`). |

---

### 📤 Success Responses

**Case 1: New Invitation Sent**
**Status: `200 OK`**
```json
{
  "message": "An invitation email has been sent"
}
```

### ❌ Error Responses

Detailed list of possible error states handled by the **Invitation Generator** controller:

| Status Code | Message | Scenario |
| :--- | :--- | :--- |
| **400 Bad Request** | `"please provide an email"` | The `email` field is missing from the request body. |
| **400 Bad Request** | `"You must provide a role"` | The `role` field is missing from the request body. |
| **200 OK (Info)** | `"user already registered as [role]"` | The user exists and already holds the role you are trying to assign. |
| **500 Internal Error** | `(Check Server Logs)` | Unexpected failure during database creation or Redis queue injection. |

---

### 🛡️ Invitation Logic & Reliability
To ensure a robust invitation system, the following backend patterns are enforced:

1. **Role Synchrony:** If an existing user (e.g., a standard 'user') is invited as 'staff', the system performs an **in-place role upgrade** rather than generating a new token. This prevents duplicate accounts for the same email.
2. **Audit Logging:** Every invitation record captures the `sender` and `sender_role`. This creates a paper trail of which administrator is authorizing new privileged access.
3. **Queue-Based Delivery:**
   - **Service:** Uses a background worker queue (`emailQueue`) to handle SMTP traffic.
   - **Retry Policy:** If the email provider fails, the system automatically retries **3 times**.
   - **Backoff Logic:** Retries are spaced by **5 seconds** to avoid rate-limiting or temporary network blips.
4. **Token Expiration:** To minimize the window of risk, all invitation tokens are strictly limited to a **60-minute** lifespan.


# 👑 Admin/Staff Registration API

## Register via Invitation
`POST` **`/api/auth/admin-staff-register/:reg_token`**

Allows invited staff or administrators to complete their account setup. This endpoint validates a specific invitation token, assigns the pre-determined role, and handles profile picture uploads.

---

### 🛠️ Execution Logic
1.  **Token Verification:** Validates that the `:reg_token` exists and is linked to the provided `email`.
2.  **Expiration Check:** Ensures the current time is before the `token_expires` timestamp.
3.  **Security:** Hashes the password using **bcrypt** (10 salt rounds).
4.  **Media Handling:** Streams the profile picture buffer to **Cloudinary** if an image is provided.
5.  **Role Persistence:** Automatically assigns the `role` (Admin or Staff) from the invitation record to the new user.
6.  **Token Revocation:** Sets the invitation token to `isActive: false` to prevent multiple registrations from one invite.

---

### 🌐 Connection Info
| Attribute | Detail |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Full URL** | `http://localhost:5000/api/auth/admin-staff-register/:reg_token` |
| **Content-Type** | `multipart/form-data` |

---

### 📥 Request Parameters

**Path Parameters**
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `reg_token` | `string` | ✅ | The unique invitation token sent to the user's email. |

**Body Parameters (Form-Data)**
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `username` | `string` | ✅ | The user's chosen display name. |
| `email` | `string` | ✅ | The email address where the invite was sent. |
| `password` | `string` | ✅ | Plaintext password (will be hashed). |
| `phone` | `string` | ❌ | Contact phone number. |
| `address` | `string` | ❌ | Physical address. |
| `profile_pic` | `file` | ❌ | Image file for the profile avatar. |

---

### 📤 Success Response
**Status: `201 Created`**
```json
{
  "message": "Registration successful. Check your email to verify account."
}
```
### ❌ Error Responses

Detailed list of possible error states handled by the **Admin/Staff Invitation** controller:

| Status Code | Message | Scenario |
| :--- | :--- | :--- |
| **400 Bad Request** | `"registration token missing"` | The `:reg_token` parameter was not included in the API URL. |
| **400 Bad Request** | `"required fields missing"` | One or more mandatory fields (`username`, `email`, `password`) are empty. |
| **400 Bad Request** | `"token not found"` | No record exists matching the provided `email` and `invite_token`. |
| **400 Bad Request** | `"email already registered"` | A user with this email address already exists in the system. |
| **200 OK** | `"token has been expired..."` | The current time exceeds the `token_expires` value in the invitation record. |
| **500 Internal Error** | `"server error"` | A failure occurred during password hashing or the Cloudinary upload stream. |

---

### 🛡️ Invitation & Security Logic
To maintain the integrity of privileged account creation, the following checks are enforced:

*   **Multi-Factor Validation:** The system does not just check the token; it validates that the token belongs specifically to the `email` address in the request body.
*   **Role Lockdown:** The `role` (e.g., 'admin' or 'staff') is pulled directly from the `token_recorde`. Even if a user attempts to inject a different role via the request body, the system ignores it.
*   **One-Time Use (OTU):** Immediately upon success, `token_recorde.isActive` is set to `false`. Any subsequent attempts to use the same token will result in a `400 Token not found` error.
*   **Buffer-to-Cloud Stream:** Profile pictures are processed in-memory using `streamifier`. This is more secure than saving files to local disk storage before uploading to Cloudinary.
