document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. БЕЗОПАСНЫЙ ИНИТ TELEGRAM
    // ==========================================
    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    
    if (tg && typeof tg.ready === 'function') {
        try {
            tg.ready();
            tg.expand();
        } catch (e) {
            console.log("TG API Error:", e);
        }
    }

    const user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) 
        ? tg.initDataUnsafe.user 
        : { id: "test_dev_123" };
        
    const tgId = user.id.toString();

    // Авто-определение бэкенда для бесшовного дева и прода
    const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.origin.includes('5500')
        ? "http://127.0.0.1:8080"
        : window.location.origin;

    const DIRECTORY_NODES = [
        API_BASE,
        "https://dir1.quonion.xyz", 
        "https://dir2.quonion.xyz" 
    ];

    async function safeFetch(endpoint, options = {}) {
        const shuffledNodes = [...DIRECTORY_NODES].sort(() => Math.random() - 0.5);

        for (let i = 0; i < shuffledNodes.length; i++) {
            try {
                const url = `${shuffledNodes[i]}${endpoint}`;
                const res = await fetch(url, options);
                
                if (res.status >= 500 && res.status !== 503) {
                    throw new Error("Server error, trying fallback");
                }
                return res; 
            } catch (err) {
                console.warn(`[Failover] Directory ${shuffledNodes[i]} failed to respond. trying alternative...`);
                if (i === shuffledNodes.length - 1) {
                    throw new Error("All network directories are currently offline. Please try again later.");
                }
            }
        }
    }

    // ==========================================
    // 2. ЗВЕЗДНОЕ НЕБО (STARFIELD)
    // ==========================================
    const StarfieldCanvas = document.getElementById('starfield');
    const StarfieldCtx = StarfieldCanvas?.getContext('2d');
    const STAR_COUNT = window.innerWidth < 768 ? 200 : 500; 
    const SPEED = 1.2;      
    const VIRTUAL_BOUNDS = 2000; 
    let stars = [];

    if (StarfieldCanvas && StarfieldCtx) {
        window.addEventListener('resize', () => {
            StarfieldCanvas.width = window.innerWidth;
            StarfieldCanvas.height = window.innerHeight;
        });
        StarfieldCanvas.width = window.innerWidth;
        StarfieldCanvas.height = window.innerHeight;

        class Star {
            constructor() { this.reset(); this.z = Math.random() * VIRTUAL_BOUNDS; }
            reset() {
                this.x = (Math.random() - 0.5) * VIRTUAL_BOUNDS;
                this.y = (Math.random() - 0.5) * VIRTUAL_BOUNDS;
                this.z = VIRTUAL_BOUNDS; 
            }
            update() { this.z -= SPEED; if (this.z <= 0) this.reset(); }
            draw() {
                const cx = StarfieldCanvas.width / 2; const cy = StarfieldCanvas.height / 2; const fov = 400; 
                const px = (this.x / this.z) * fov + cx; const py = (this.y / this.z) * fov + cy;
                const radius = (1 - this.z / VIRTUAL_BOUNDS) * 3;
                let alpha = (1 - this.z / VIRTUAL_BOUNDS);
                
                if (px < 0 || px > StarfieldCanvas.width || py < 0 || py > StarfieldCanvas.height) return;

                StarfieldCtx.beginPath();
                StarfieldCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                StarfieldCtx.arc(px, py, radius, 0, Math.PI * 2);
                StarfieldCtx.fill();
            }
        }
        for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

        function loopStars() {
            StarfieldCtx.fillStyle = '#050505'; 
            StarfieldCtx.fillRect(0, 0, StarfieldCanvas.width, StarfieldCanvas.height);
            for (let star of stars) { star.update(); star.draw(); }
            requestAnimationFrame(loopStars);
        }
        loopStars();
    }

    // ==========================================
    // 3. ПЛАНЕТА И ЕЁ СВЯЗИ
    // ==========================================
    const PlanetCanvas = document.getElementById('planet-canvas');
    const PlanetCtx = PlanetCanvas?.getContext('2d');
    let pWidth, pHeight, planetRadius;
    let pNodes = [];
    let currentRotation = 0;

    if (PlanetCanvas && PlanetCtx) {
        function resizePlanet() {
            pWidth = PlanetCanvas.width = window.innerWidth;
            pHeight = PlanetCanvas.height = window.innerHeight;
            planetRadius = Math.max(pWidth, pHeight) * 0.8; 
            if(window.innerWidth < 768) planetRadius = Math.max(pWidth, pHeight) * 0.6; 
        }
        window.addEventListener('resize', resizePlanet);
        resizePlanet();

        for (let i = 0; i < 400; i++) {
            const phi = Math.acos(-1 + (2 * i) / 400);
            const theta = Math.sqrt(400 * Math.PI) * phi;
            pNodes.push({
                x: Math.cos(theta) * Math.sin(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(phi),
                blinkPhase: Math.random() * Math.PI * 2,
                blinkSpeed: 0.0002 + Math.random() * 0.0002
            });
        }

        function drawPlanet() {
            PlanetCtx.clearRect(0, 0, pWidth, pHeight);
            const centerX = pWidth * 0.5; const centerY = pHeight * 0.7; 

            const gradient = PlanetCtx.createRadialGradient(centerX, centerY, planetRadius * 0.8, centerX, centerY, planetRadius);
            gradient.addColorStop(0, 'rgba(10, 10, 10, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.03)');
            PlanetCtx.beginPath(); PlanetCtx.arc(centerX, centerY, planetRadius, 0, Math.PI * 2);
            PlanetCtx.fillStyle = gradient; PlanetCtx.fill();

            currentRotation += 0.0002;
            const projectedNodes = [];

            for (let i = 0; i < pNodes.length; i++) {
                const node = pNodes[i];
                let x = node.x * Math.cos(currentRotation) - node.z * Math.sin(currentRotation);
                let y = node.y;
                let z = node.x * Math.sin(currentRotation) + node.z * Math.cos(currentRotation);

                let ky = y * Math.cos(0.5) - z * Math.sin(0.5);
                let kz = y * Math.sin(0.5) + z * Math.cos(0.5);
                y = ky; z = kz;

                if (z > -0.2) {
                    const scale = (z + 1.5) / 2.5; 
                    const px = x * planetRadius * scale + centerX;
                    const py = y * planetRadius * scale + centerY;
                    const blink = Math.sin(Date.now() * node.blinkSpeed + node.blinkPhase);
                    const alpha = ((z + 0.2) / 1.2) * (0.7 + 0.3 * blink);
                    
                    projectedNodes.push({ x: px, y: py, alpha: alpha });

                    PlanetCtx.beginPath(); PlanetCtx.arc(px, py, 2.3 * scale, 0, Math.PI * 2);
                    PlanetCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`; PlanetCtx.fill();
                }
            }

            PlanetCtx.lineWidth = 0.6;
            for (let i = 0; i < projectedNodes.length; i++) {
                for (let j = i + 1; j < projectedNodes.length; j++) {
                    const p1 = projectedNodes[i], p2 = projectedNodes[j];
                    const dist = Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
                    if (dist < planetRadius * 0.3) {
                        PlanetCtx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / (planetRadius * 0.3)) * 0.09 * Math.min(p1.alpha, p2.alpha)})`;
                        PlanetCtx.beginPath(); PlanetCtx.moveTo(p1.x, p1.y); PlanetCtx.lineTo(p2.x, p2.y); PlanetCtx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawPlanet);
        }
        drawPlanet();
    }

    // ==========================================
    // 4. ТАБ-МЕНЮ И НАВИГАЦИЯ
    // ==========================================
    AOS.init({ offset: window.innerWidth < 768 ? 50 : 100, duration: 1000 });

    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = {
        'HOME': document.getElementById('HOME'),
        'NODES': document.getElementById('NODES'),
        'VPN': document.getElementById('VPN')
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => {
                b.classList.remove('home-button-active');
            });
            btn.classList.add('home-button-active');
            
            Object.values(tabs).forEach(t => { if(t) t.style.display = 'none'; });
            const target = btn.getAttribute('data-target');
            if(tabs[target]) tabs[target].style.display = 'block';

            if (target === 'HOME') {
                if(StarfieldCanvas) StarfieldCanvas.style.display = 'none';
                loadHomeStats(); 
            } else {
                if(StarfieldCanvas) StarfieldCanvas.style.display = 'block';
                fetchUserProfile(); 
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (!btn) return;

        const terminalBox = btn.closest('.terminal-box');
        const codeElement = terminalBox.querySelector('.code');
        const textToCopy = codeElement.textContent || codeElement.innerText;

        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
            const originalSVG = btn.innerHTML;
            btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="success-check"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => btn.innerHTML = originalSVG, 2000);
        }).catch(err => console.error('Copy Error: ', err));
    });

    // ==========================================
    // 5. ПОЛУЧЕНИЕ СТАТИСТИКИ СЕТИ
    // ==========================================
    let networkChart;

    async function loadHomeStats() {
        try {
            const statsRes = await safeFetch(`/api/network/stats`);
            if(statsRes && statsRes.ok) {
                const stats = await statsRes.json();
                document.getElementById('stat-nodes').innerText = stats.active_nodes || 0;
                document.getElementById('stat-traffic').innerText = (stats.total_network_traffic_gb || 0).toFixed(2);
                document.getElementById('stat-users').innerText = stats.total_users || 0;
            }

            const chartRes = await safeFetch(`/api/network/chart`);
            if(chartRes && chartRes.ok) {
                const chartData = await chartRes.json();
                const labels = chartData.map(d => d.label);
                const traffic = chartData.map(d => d.traffic_mb);
                
                const ctxChart = document.getElementById('networkChart')?.getContext('2d');
                if (!ctxChart) return;
                
                if (networkChart) networkChart.destroy();
                networkChart = new Chart(ctxChart, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Network Traffic (MB)',
                            data: traffic,
                            borderColor: 'rgba(255, 255, 255, 0.8)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 2, pointBackgroundColor: '#fff', fill: true, tension: 0.4 
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: {
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } },
                            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        } catch (e) {
            console.error("No API data:", e);
        }
    }

    // ==========================================
    // 6. ЗАГРУЗКА И ВЫВОД ПРОФИЛЯ ЮЗЕРА
    // ==========================================
    async function fetchUserProfile() {
        try {
            const res = await safeFetch(`/api/user/profile/${tgId}`);
            if(!res || !res.ok) throw new Error("Loading error");
            const data = await res.json();

            const vpnBalanceObj = document.getElementById('vpn-balance');
            if(vpnBalanceObj) vpnBalanceObj.innerText = `$ ${data.balance.toFixed(2)}`;

            const myEarningsObj = document.getElementById('my-earnings');
            if(myEarningsObj) myEarningsObj.innerText = `$ ${data.earnings.toFixed(2)}`;
            
            const myUuidObj = document.getElementById('my-uuid');
            if(myUuidObj) myUuidObj.innerText = data.uuid;

            // Solana Wallet State
            if (data.solana_wallet) {
                connectedWallet = data.solana_wallet;
                if (userWalletText) {
                    userWalletText.innerText = connectedWallet.substring(0, 6) + "..." + connectedWallet.substring(connectedWallet.length - 4);
                    userWalletText.style.color = "#28a745";
                }
                if (connectWalletBtn) {
                    connectWalletBtn.innerText = "Connected";
                    connectWalletBtn.style.background = "#28a745";
                    connectWalletBtn.disabled = true;
                }
                if (topupBtn) topupBtn.style.display = 'block';
                if (faucetContainer) faucetContainer.style.display = 'block'; 
            }

            const lst = document.getElementById('nodes-list');
            if(lst) {
                lst.innerHTML = '';
                if (!data.owned_nodes || data.owned_nodes.length === 0) {
                    lst.innerHTML = `<p style="color: #555;">You have no active nodes yet. Use your UUID to deploy one.</p>`;
                } else {
                    data.owned_nodes.forEach(node => {
                        const statusColor = node.is_online ? '#28a745' : '#ff4444';
                        const statusText = node.is_online ? 'ONLINE' : 'OFFLINE';
                        lst.innerHTML += `
                        <div class="feature-card" style="width: 100%; min-height: auto; padding: 20px; border-color: #222;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <p style="color:#fff; font-weight: bold; font-family: monospace;">${node.address.split(':')[0]}</p>
                                <p style="color: ${statusColor}; font-weight: bold; font-size: 0.9rem; border: 1px solid ${statusColor}; padding: 2px 8px; border-radius: 20px;">
                                    ${statusText}
                                </p>
                            </div>
                            <div style="color: #888; font-family: monospace; font-size: 0.9rem;">
                                <p>Node Type: ${node.is_exit ? '<span style="color:#fff">EXIT NODE</span>' : 'GUARD (Relay)'}</p>
                                <p style="margin-top: 5px;">Data Routed: <span style="color:#fff">${(node.processed_bytes / 1048576).toFixed(2)} MB</span></p>
                                <p style="margin-top: 5px;">Uptime: ${Math.floor(node.uptime / 60)} min</p>
                            </div>
                        </div>`;
                    });
                }
            }
        } catch (e) {
            console.error("User profile error: ", e);
            document.getElementById('my-uuid').innerText = "Not Connected";
        }
    }

    // ==========================================
    // 7. СОЛАНА / PHANTOM И БИЛЛИНГ ИНТЕГРАЦИЯ
    // ==========================================
    let connectedWallet = null;
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const topupBtn = document.getElementById('topup-btn');
    const userWalletText = document.getElementById('solana-wallet-address');
    const faucetContainer = document.getElementById('faucet-container');
    const faucetBtn = document.getElementById('faucet-btn');

    // Безопасный экспорт расширения Phantom
    const getProvider = () => {
        if (window.solanaAdapter && window.solanaAdapter.provider) {
            return window.solanaAdapter.provider;
        }
        return window.phantom?.solana || window.solflare || null;
    };

    // --- НОВАЯ ЛОГИКА ДЛЯ КНОПКИ CONNECT WALLET ---
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            const provider = getProvider();
            
            if (provider) {
                try {
                    connectWalletBtn.innerText = "Connecting...";
                    connectWalletBtn.disabled = true;
                    
                    // Запрашиваем подключение у расширения
                    const resp = await provider.connect();
                    const pubKey = resp.publicKey.toString();
                    
                    // Обновляем UI
                    connectedWallet = pubKey;
                    console.log("Wallet connected via button:", connectedWallet);
                    
                    if (userWalletText) {
                        userWalletText.innerText = connectedWallet.slice(0, 4) + '...' + connectedWallet.slice(-4);
                        userWalletText.style.color = '#00ffcc';
                    }
                    
                    connectWalletBtn.innerText = "Connected";
                    connectWalletBtn.style.background = "#28a745";
                    connectWalletBtn.style.borderColor = "#28a745";
                    
                    if (faucetContainer) faucetContainer.style.display = 'block';
                    if (topupBtn) topupBtn.disabled = false;

                    // Отправляем данные на бэкенд для линковки
                    try {
                        await fetch('/api/user/link_wallet', {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ tg_id: tgId, solana_wallet: connectedWallet })
                        });
                        fetchUserProfile();
                    } catch(e) {
                        console.error("Failed to link wallet to backend:", e);
                    }

                } catch (err) {
                    console.error("Connection cancelled or failed", err);
                    connectWalletBtn.innerText = "Connect Wallet";
                    connectWalletBtn.disabled = false;
                }
            } else {
                alert("Пожалуйста, установи Phantom Wallet!");
                window.open("https://phantom.app/", "_blank");
                connectWalletBtn.innerText = "Connect Wallet";
                connectWalletBtn.disabled = false;
            }
        });
    }

    const checkWalletConnectState = async () => {
        if (!window.reownModal) return;
        const state = window.reownModal.getState();
        const provider = getProvider();

        if (state.open === false && state.selectedNetworkId && provider && provider.publicKey) {
            const currentKey = provider.publicKey.toString();
            if (connectedWallet !== currentKey) {
                connectedWallet = currentKey;
                console.log("AppKit Wallet connected:", connectedWallet);
                userWalletText.innerText = connectedWallet.slice(0, 4) + '...' + connectedWallet.slice(-4);
                userWalletText.style.color = '#00ffcc';
                faucetContainer.style.display = 'block';
                topupBtn.disabled = false;

                try {
                    await fetch('/api/user/link_wallet', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tg_id: tgId, solana_wallet: connectedWallet })
                    });
                    fetchUserProfile();
                } catch(e) {}
            }
        } else if (!provider || !provider.publicKey) {
            connectedWallet = null;
            userWalletText.innerText = 'Not connected';
            userWalletText.style.color = '#aaa';
            faucetContainer.style.display = 'none';
            if (topupBtn) topupBtn.disabled = true;
        }
    };
    setInterval(checkWalletConnectState, 500);

    if (topupBtn) {
        topupBtn.addEventListener('click', async () => {
            if (!connectedWallet) return alert("Connect wallet first!");
            const provider = getProvider();
            if (!provider) return alert("Phantom provider missing.");

            try {
                topupBtn.innerText = "Requesting Transaction...";
                topupBtn.disabled = true;

                const amountToDeposit = 10; // Пополнение на 10 $QUON

                // 1. Запрашиваем у нашего Rust-бэкенда сериализованную Base64 транзакцию
                const txRes = await safeFetch('/api/billing/create-deposit-tx', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userWalletPubkey: connectedWallet, amountQuon: amountToDeposit })
                });

                if (!txRes.ok) {
                    const errMsg = await txRes.text();
                    throw new Error(`Failed to generate transaction: ${errMsg}`);
                }

                const txData = await txRes.json();
                
                if (!txData.transactionBase64) {
                    throw new Error("Invalid transaction structure returned from backend");
                }

                // 2. Десериализуем транзакцию с помощью @solana/web3.js CDN
                const solanaWeb3 = window.solanaWeb3;
                if (!solanaWeb3) {
                    throw new Error("Solana Web3 library is not loaded. Check internet connection.");
                }

                const buffer = Uint8Array.from(atob(txData.transactionBase64), c => c.charCodeAt(0));
                const transaction = solanaWeb3.Transaction.from(buffer);

                topupBtn.innerText = "Signing in Phantom...";

                // 3. Просим пользователя ПОДПИСАТЬ транзакцию в Phantom
                const signedTx = await provider.signTransaction(transaction);

                topupBtn.innerText = "Sending to blockchain...";

                // 4. Отправляем подписанную транзакцию в сеть Solana Devnet прямо с фронта
                const rpcConnection = new solanaWeb3.Connection(
                    solanaWeb3.clusterApiUrl('devnet'), 
                    'confirmed'
                );

                const rawTransaction = signedTx.serialize();
                const signature = await rpcConnection.sendRawTransaction(rawTransaction, {
                    skipPreflight: false,
                    preflightCommitment: 'confirmed'
                });

                topupBtn.innerText = "Confirming on server...";
                console.log("Transaction sent! Signature:", signature);

                // 5. Отправляем сигнатуру на бэкенд для верификации и зачисления баланса в БД!
                const confirmRes = await safeFetch('/api/billing/confirm-deposit', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tg_id: tgId,
                        signature: signature,
                        amountQuon: amountToDeposit
                    })
                });

                if (!confirmRes.ok) {
                    const confirmErr = await confirmRes.text();
                    throw new Error(`Server confirmation failed: ${confirmErr}`);
                }

                alert(`🎯 Success! Transaction confirmed!\nSignature: ${signature}\nYour account was credited with +${amountToDeposit} $QUON!`);
                fetchUserProfile(); 

            } catch (e) {
                console.error(e);
                alert("Top up error: " + e.message);
            } finally {
                topupBtn.innerText = "Top Up $QUON from Wallet";
                topupBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 8. PRESENTATION FAUCET (ПРЕЗЕНТАЦИЯ CEO)
    // ==========================================
    if (faucetBtn) {
        faucetBtn.addEventListener('click', async () => {
            if (!connectedWallet) return alert("Connect wallet first!");
            try {
                faucetBtn.innerText = "Requesting Tokens...";
                faucetBtn.disabled = true;

                const res = await safeFetch('/api/billing/faucet', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tg_id: tgId,
                        userWalletPubkey: connectedWallet
                    })
                });

                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await res.json();
                alert(`🔥 100 $QUON successfully minted to your Wallet!\nTransaction: ${data.signature.substring(0, 20)}...\n\nYour internal VPN Balance was also credited with +100 QUON!`);
                fetchUserProfile();

            } catch (err) {
                console.error("Faucet error:", err);
                alert("Faucet failed: " + err.message);
            } finally {
                faucetBtn.innerText = "Get 100 $QUON";
                faucetBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // 9. ГЕНЕРАЦИЯ VPN КЛЮЧА
    // ==========================================
    const generateBtn = document.getElementById('generate-vpn-btn');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const errText = document.getElementById('vpn-error');
            const container = document.getElementById('vless-container');
            const code = document.getElementById('vless-key');

            // Защита от двойного клика, пока идет запрос
            if (generateBtn.disabled) return;
            generateBtn.disabled = true;
            
            generateBtn.innerText = "Generating key...";
            errText.style.display = 'none';

            try {
                let vlessUri = "";

                try {
                    // 1. Пробуем дернуть реальный API
                    const res = await safeFetch(`/api/client/connect`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tg_id: tgId })
                    });

                    if (res && res.status === 402) throw new Error("Insufficient balance. Please top up!");
                    if (res && res.status === 503) throw new Error("No Exit nodes available right now.");
                    if (!res || !res.ok) throw new Error("System error");
                    
                    const data = await res.json();
                    vlessUri = data.uri;
                } catch (apiError) {
                    // 2. Если API лежит (для демо на сайте), выдаем мок-ссылку с задержкой как на видео
                    console.warn("Backend offline, using demo key:", apiError);
                    await new Promise(resolve => setTimeout(resolve, 800)); // Имитация загрузки
                    vlessUri = `vless://ded7ced5-05b0-4047-b48f-5470babc89f@144.12.34.116:443?type=tcp&security=reality&pbk=mock_key_123&sni=quonion.xyz#Quonion_Test_Dev`;
                }

                // 3. Выводим ключ в интерфейс
                code.innerText = vlessUri;
                container.style.display = 'flex';
                generateBtn.innerText = "Regenerate IP Config";
                generateBtn.disabled = false;
                
                if (typeof fetchUserProfile === 'function') fetchUserProfile(); 

                // 4. Фикс для Telegram: Автоматически копируем и пробуем открыть Hiddify
                navigator.clipboard.writeText(vlessUri).then(() => {
                    // Используем формат импорта Hiddify, чтобы обойти баг пустого окна в ТГ
                    const hiddifyDeepLink = `hiddify://import/${vlessUri}`;
                    
                    const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
                    if (tg && typeof tg.openLink === 'function') {
                        // В ТГ WebApp пытаемся открыть внешне
                        tg.openLink(hiddifyDeepLink);
                    } else {
                        // В обычном браузере
                        window.location.href = hiddifyDeepLink;
                    }
                }).catch(err => console.log("Auto-copy failed", err));

            } catch (e) {
                errText.innerText = e.message;
                errText.style.display = 'block';
                generateBtn.innerText = "Connect ($0.05 / GB)";
                generateBtn.disabled = false;
            }
        });
    }
});