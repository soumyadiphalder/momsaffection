<?php
// backend/index.php

// db.php loads env and sets CORS headers
require_once __DIR__ . '/config/db.php';

// Check if request expects HTML
$accept = $_SERVER['HTTP_ACCEPT'] ?? '';
$wantsHtml = (strpos($accept, 'text/html') !== false);

if ($wantsHtml) {
    // Override Content-Type header from db.php to output HTML
    header("Content-Type: text/html; charset=UTF-8");
    $dbNameVal = getenv('DB_DATABASE') ?: 'moms_db';
    $dbHostVal = getenv('DB_HOST') ?: 'localhost';
    $currentPort = $_SERVER['SERVER_PORT'] ?? '8080';
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MomsAffection Backend API Status</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-color: #0d0f12;
                --card-bg: #15181e;
                --text-color: #e2e8f0;
                --text-muted: #94a3b8;
                --primary: #c084fc;
                --primary-glow: rgba(192, 132, 252, 0.15);
                --success: #34d399;
                --success-glow: rgba(52, 211, 153, 0.15);
                --warning: #fbbf24;
                --warning-glow: rgba(251, 191, 36, 0.15);
                --error: #f87171;
                --error-glow: rgba(248, 113, 113, 0.15);
                --border: #222730;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            body {
                font-family: 'Outfit', sans-serif;
                background-color: var(--bg-color);
                color: var(--text-color);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                overflow-x: hidden;
            }

            /* Background decorative elements */
            .glow-circle {
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
                top: -100px;
                right: -100px;
                z-index: 1;
                pointer-events: none;
            }
            .glow-circle-2 {
                position: absolute;
                width: 500px;
                height: 500px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(52, 211, 153, 0.08) 0%, transparent 70%);
                bottom: -150px;
                left: -150px;
                z-index: 1;
                pointer-events: none;
            }

            .container {
                position: relative;
                z-index: 2;
                max-width: 650px;
                width: 100%;
                background: var(--card-bg);
                border: 1px solid var(--border);
                border-radius: 24px;
                padding: 3rem 2.5rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(10px);
                animation: fadeIn 0.8s ease-out;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .header {
                text-align: center;
                margin-bottom: 2.5rem;
            }

            .logo-icon {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 70px;
                height: 70px;
                background: var(--primary-glow);
                border: 2px solid var(--primary);
                border-radius: 20px;
                color: var(--primary);
                font-size: 2.2rem;
                font-weight: 800;
                margin-bottom: 1rem;
                box-shadow: 0 0 20px var(--primary-glow);
            }

            h1 {
                font-size: 2.2rem;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 0.5rem;
            }

            .subtitle {
                color: var(--text-muted);
                font-size: 1.1rem;
            }

            .status-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 2.5rem;
            }

            @media (max-width: 480px) {
                .status-grid {
                    grid-template-columns: 1fr;
                }
            }

            .status-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--border);
                padding: 1.5rem;
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                transition: all 0.3s ease;
            }

            .status-card:hover {
                transform: translateY(-2px);
                border-color: rgba(192, 132, 252, 0.3);
                background: rgba(255, 255, 255, 0.03);
            }

            .status-label {
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-muted);
                margin-bottom: 0.5rem;
            }

            .status-value {
                font-size: 1.25rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                display: inline-block;
            }

            .dot.success {
                background-color: var(--success);
                box-shadow: 0 0 10px var(--success-glow);
            }

            .port-badge {
                background: rgba(251, 191, 36, 0.1);
                color: var(--warning);
                padding: 0.2rem 0.6rem;
                border-radius: 6px;
                font-family: monospace;
                font-size: 1rem;
                border: 1px solid rgba(251, 191, 36, 0.2);
            }

            .port-badge.correct {
                background: rgba(52, 211, 153, 0.1);
                color: var(--success);
                border: 1px solid rgba(52, 211, 153, 0.2);
            }

            .warning-banner {
                background: rgba(239, 68, 68, 0.08);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #f87171;
                padding: 1.25rem;
                border-radius: 14px;
                margin-bottom: 2rem;
                font-size: 0.95rem;
                line-height: 1.6;
            }

            .warning-banner strong {
                color: #fff;
                display: inline-block;
                margin-bottom: 0.25rem;
            }

            .code-block {
                background: rgba(0, 0, 0, 0.4);
                padding: 0.4rem 0.75rem;
                border-radius: 6px;
                display: inline-block;
                margin-top: 0.5rem;
                color: #fff;
                font-family: monospace;
                font-size: 0.9rem;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .info-section {
                border-top: 1px solid var(--border);
                padding-top: 2rem;
            }

            .info-title {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: #fff;
            }

            .endpoint-list {
                list-style: none;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .endpoint-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(255, 255, 255, 0.01);
                padding: 0.75rem 1rem;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.02);
                font-size: 0.9rem;
            }

            .method-badge {
                font-size: 0.75rem;
                font-weight: bold;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-family: monospace;
            }

            .method-get {
                background: rgba(52, 211, 153, 0.1);
                color: var(--success);
                border: 1px solid rgba(52, 211, 153, 0.2);
            }

            .method-post {
                background: rgba(192, 132, 252, 0.1);
                color: var(--primary);
                border: 1px solid rgba(192, 132, 252, 0.2);
            }

            .path-text {
                font-family: monospace;
                color: var(--text-color);
            }

            .footer-note {
                text-align: center;
                margin-top: 2.5rem;
                font-size: 0.85rem;
                color: var(--text-muted);
                line-height: 1.5;
            }
        </style>
    </head>
    <body>
        <div class="glow-circle"></div>
        <div class="glow-circle-2"></div>

        <div class="container">
            <div class="header">
                <div class="logo-icon">MA</div>
                <h1>MomsAffection</h1>
                <p class="subtitle">Stateless PHP Backend API Service</p>
            </div>

            <div class="status-grid">
                <div class="status-card">
                    <span class="status-label">API Status</span>
                    <span class="status-value">
                        <span class="dot success"></span> Running
                    </span>
                </div>
                <div class="status-card">
                    <span class="status-label">Current Port</span>
                    <span class="status-value">
                        <span class="port-badge <?= ($currentPort === '8000') ? 'correct' : '' ?>"><?= htmlspecialchars($currentPort) ?></span>
                    </span>
                </div>
            </div>

            <?php if ($currentPort !== '8000'): ?>
            <div class="warning-banner">
                <strong>⚠️ Warning: Port Mismatch Detected</strong><br>
                Your PHP server is currently running on port <strong><?= htmlspecialchars($currentPort) ?></strong>. However, the React frontend is configured to communicate with the API on port <strong>8000</strong>.
                <br>
                To avoid CORS and connection failures, please restart your PHP server on port 8000 using:
                <br>
                <div class="code-block">php -S localhost:8000</div>
            </div>
            <?php endif; ?>

            <div class="info-section">
                <h2 class="info-title">Core API Routes Available</h2>
                <ul class="endpoint-list">
                    <li class="endpoint-item">
                        <span class="path-text">/api/auth/login.php</span>
                        <span class="method-badge method-post">POST</span>
                    </li>
                    <li class="endpoint-item">
                        <span class="path-text">/api/auth/register.php</span>
                        <span class="method-badge method-post">POST</span>
                    </li>
                    <li class="endpoint-item">
                        <span class="path-text">/api/products/list.php</span>
                        <span class="method-badge method-get">GET</span>
                    </li>
                    <li class="endpoint-item">
                        <span class="path-text">/api/cart/manage.php</span>
                        <span class="method-badge method-post">GET/POST/PUT/DELETE</span>
                    </li>
                </ul>
            </div>

            <div class="footer-note">
                Database connected successfully to <code style="color: #fff;"><?= htmlspecialchars($dbNameVal) ?></code> on <code style="color: #fff;"><?= htmlspecialchars($dbHostVal) ?></code>.<br>
                Refer to <code style="color: #fff;">walkthrough.md</code> for setup instructions.
            </div>
        </div>
    </body>
    </html>
    <?php
} else {
    // Respond with JSON
    echo json_encode([
        "success" => true,
        "message" => "MomsAffection PHP API Backend is running successfully.",
        "port" => $_SERVER['SERVER_PORT'] ?? '8080',
        "db_connected" => true,
        "warning" => ($_SERVER['SERVER_PORT'] ?? '8080') !== '8000' ? "React frontend expects API on port 8000. Current port is " . ($_SERVER['SERVER_PORT'] ?? '8080') : null
    ]);
}
?>
