<?php
require_once 'config.php';

$error_message = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    
    if (empty($username) || empty($password)) {
        $error_message = 'Please fill in all fields';
    } else {
        try {
            // Check user credentials
            $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password'])) {
                // Login successful
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                header('Location: dashboard.php');
                exit();
            } else {
                $error_message = 'Invalid username or password';
            }
        } catch(PDOException $e) {
            $error_message = 'Database error occurred';
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Welcome Back</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .login-container {
            width: 100%;
            max-width: 400px;
        }

        .login-card {
            background: white;
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .avatar-container {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
        }

        .avatar {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .avatar-inner {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, #60a5fa, #3b82f6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }

        .welcome-text {
            text-align: center;
            margin-bottom: 2rem;
        }

        .welcome-title {
            font-size: 1.75rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .username {
            font-size: 1.125rem;
            font-weight: 600;
            color: #6b7280;
            letter-spacing: 0.1em;
        }

        .fingerprint-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 2rem;
        }

        .fingerprint-btn {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .fingerprint-btn:hover {
            background: #f3f4f6;
        }

        .fingerprint-icon {
            width: 32px;
            height: 32px;
            stroke: #6b7280;
            stroke-width: 2;
            fill: none;
        }

        .fingerprint-text {
            color: #374151;
            font-weight: 500;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .password-container {
            position: relative;
        }

        .form-input {
            width: 100%;
            height: 56px;
            padding: 0 1rem;
            padding-right: 4rem;
            font-size: 1.125rem;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            outline: none;
            transition: border-color 0.2s;
        }

        .form-input:focus {
            border-color: #3b82f6;
        }

        .form-input::placeholder {
            color: #9ca3af;
        }

        .show-password {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #3b82f6;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.875rem;
        }

        .show-password:hover {
            color: #2563eb;
        }

        .login-btn {
            width: 100%;
            height: 56px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.125rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .login-btn:hover {
            background: #1d4ed8;
        }

        .logout-link {
            text-align: center;
        }

        .logout-link button {
            background: none;
            border: none;
            color: #ef4444;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s;
        }

        .logout-link button:hover {
            color: #dc2626;
        }

        .error-message {
            background: #fef2f2;
            color: #dc2626;
            padding: 0.75rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
            border: 1px solid #fecaca;
        }

        .hidden {
            display: none;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 1.5rem;
            }
            
            .welcome-title {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <!-- Profile Avatar -->
            <div class="avatar-container">
                <div class="avatar">
                    <div class="avatar-inner">
                        👦
                    </div>
                </div>
            </div>

            <!-- Welcome Text -->
            <div class="welcome-text">
                <h1 class="welcome-title">Welcome Back</h1>
                <p class="username">FAUZAN</p>
            </div>

            <!-- Fingerprint Authentication -->
            <div class="fingerprint-section">
                <button type="button" class="fingerprint-btn" onclick="simulateFingerprint()">
                    <svg class="fingerprint-icon" viewBox="0 0 24 24">
                        <path d="M2.68 12.192a9 9 0 0 1 14.64 0"/>
                        <path d="M4.222 15.578a6 6 0 0 1 9.556 0"/>
                        <path d="M6.176 18.247a3 3 0 0 1 4.648 0"/>
                        <path d="M9 21a1 1 0 0 1 2 0"/>
                        <path d="M12 2a9 9 0 0 1 9 9 9 9 0 0 1-9 9"/>
                        <path d="M16.5 7.5a6 6 0 0 1 1.5 4 6 6 0 0 1-1.5 4"/>
                        <path d="M19.5 10.5a3 3 0 0 1 0 3"/>
                    </svg>
                </button>
                <p class="fingerprint-text">Scan Your Fingerprint</p>
            </div>

            <!-- Login Form -->
            <form method="POST" action="login.php">
                <?php if ($error_message): ?>
                    <div class="error-message">
                        <?php echo htmlspecialchars($error_message); ?>
                    </div>
                <?php endif; ?>

                <div class="form-group">
                    <div class="password-container">
                        <input 
                            type="text" 
                            name="username" 
                            class="form-input" 
                            placeholder="Username" 
                            required
                            value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>"
                        >
                    </div>
                </div>

                <div class="form-group">
                    <div class="password-container">
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            class="form-input" 
                            placeholder="Password" 
                            required
                        >
                        <button type="button" class="show-password" onclick="togglePassword()">
                            <span id="show-text">Show</span>
                        </button>
                    </div>
                </div>

                <button type="submit" class="login-btn">Login</button>
            </form>

            <!-- Logout Link -->
            <div class="logout-link">
                <button type="button" onclick="logout()">Not my Account? Logout</button>
            </div>
        </div>
    </div>

    <script>
        function togglePassword() {
            const passwordInput = document.getElementById('password');
            const showText = document.getElementById('show-text');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                showText.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                showText.textContent = 'Show';
            }
        }

        function simulateFingerprint() {
            alert('Fingerprint authentication would be implemented here');
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'logout.php';
            }
        }
    </script>
</body>
</html>
