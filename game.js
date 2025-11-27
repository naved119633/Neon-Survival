// ========================================
// NEON SURVIVAL - ENHANCED VERSION
// Features: Power-ups, Health, Boss, Achievements, Sounds
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make canvas responsive - FULLSCREEN on mobile!
function resizeCanvas() {
    if (window.innerWidth <= 768) {
        // Mobile - FULLSCREEN!
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // Desktop - original size
        canvas.width = 900;
        canvas.height = 550;
    }
}

// Initial resize
resizeCanvas();

// Resize on window resize
window.addEventListener('resize', resizeCanvas);

// Arrays - DECLARE FIRST!
const backgroundStars = [];

// Initialize background stars
function initBackgroundStars() {
    backgroundStars.length = 0;
    for (let i = 0; i < 100; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random()
        });
    }
}

initBackgroundStars();

// DOM Elements
const timeInfo = document.getElementById("timeInfo");
const scoreInfo = document.getElementById("scoreInfo");
const enemyInfo = document.getElementById("enemyInfo");
const healthInfo = document.getElementById("healthInfo");
const waveInfo = document.getElementById("waveInfo");
const achievementBox = document.getElementById("achievementBox");
const achievementText = document.getElementById("achievementText");
const loginScreen = document.getElementById("loginScreen");
const startScreen = document.getElementById("startScreen");
const pauseBanner = document.getElementById("pauseBanner");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalTime = document.getElementById("finalTime");
const finalScore = document.getElementById("finalScore");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const difficultySelect = document.getElementById("difficultySelect");
const perksBtn = document.getElementById("perksBtn");
const weaponHUD = document.getElementById("weaponHUD");
const miniMap = document.getElementById("miniMap");
const leaderboardList = document.getElementById("leaderboardList");

// Login Elements - REMOVED (No longer needed)

// Shop Elements
const shopScreen = document.getElementById("shopScreen");
const shopBtn = document.getElementById("shopBtn");
const closeShopBtn = document.getElementById("closeShopBtn");
const shopCoins = document.getElementById("shopCoins");
const shopGems = document.getElementById("shopGems");

// Stats Elements
const statsScreen = document.getElementById("statsScreen");
const statsBtn = document.getElementById("statsBtn");
const closeStatsBtn = document.getElementById("closeStatsBtn");

// Challenge Elements
const challengesScreen = document.getElementById("challengesScreen");
const challengesBtn = document.getElementById("challengesBtn");
const closeChallengesBtn = document.getElementById("closeChallengesBtn");
const challengeTimer = document.getElementById("challengeTimer");

// Mobile Controls - REMOVED (Using direct touch-to-move)
// const mobileControls = document.getElementById("mobileControls");
// const joystickContainer = document.getElementById("joystickContainer");
// const joystickBase = document.getElementById("joystickBase");
// const joystickStick = document.getElementById("joystickStick");
// const shootBtn = document.getElementById("shootBtn");
// const dashBtn = document.getElementById("dashBtn");
// const ultBtn = document.getElementById("ultBtn");

// Game State
let isGameOver = false;
let isRunning = false;
let isPaused = false;
let gameTime = 0;
let score = 0;
let combo = 1;
let comboTimer = 0;
let wave = 1;
let enemiesKilled = 0;
let bossActive = false;
let slowMotion = false;
let slowMotionTimer = 0;
let screenShake = 0;
let shopOpen = false;
let screenFlash = 0;
let screenFlashColor = '#ffffff';

// Challenge tracking
let noDamageTime = 0;
let maxNoDamageTime = 0;

// LEVEL SYSTEM - Progressive Difficulty with Persistence!
let currentLevel = 1;
let levelProgress = 0;
let enemiesRequiredForLevel = 10; // Enemies to kill for next level
let levelTransitioning = false;
let levelTransitionTimer = 0;
let maxUnlockedLevel = 1; // Highest level user has reached
let completedLevels = []; // Array of completed level numbers

// Player - NEECHE position pe!
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50, // NEECHE - bottom of screen!
    size: 16,
    speed: 2.0, // Slower speed for better control!
    vx: 0,
    vy: 0,
    targetX: canvas.width / 2, // AI smooth interpolation target
    smoothFactor: 0.15, // AI lerp factor
    health: 8, // Bahut zyada health!
    maxHealth: 8,
    invincible: false,
    invincibleTimer: 0,
    shield: false,
    shieldTimer: 0,
    speedBoost: false,
    speedBoostTimer: 0,
    rapidFire: false,
    rapidFireTimer: 0,
    shootCooldown: 0,
    // NEW FEATURES
    coins: 0,
    gems: 0,
    dashCooldown: 0,
    dashDuration: 0,
    ultimateCooldown: 0,
    ultimateCharge: 0,
    weaponLevel: 1,
    killStreak: 0,
    maxKillStreak: 0,
    weaponType: 'normal', // normal, laser, shotgun, sniper
    critChance: 0.25, // 25% crit chance - bahut zyada!
    critMultiplier: 3 // 3x damage on crit!
};

// Arrays
const enemies = [];
const bullets = [];
const hitParticles = [];
const powerUps = [];
const floatingTexts = [];
const drops = [];
const explosions = [];
// backgroundStars already declared above

// Input
let keys = {};
let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };
let mouseDown = false;

// Mobile Touch Input - Direct touch-to-move
let touchShooting = false;
let touchMoving = false;
let touchTargetX = 0;

// Spawn timers
let spawnTimer = 0;
let spawnInterval = 300; // SUPER slow spawning - bahut easy game!
let powerUpTimer = 0;

// Achievements
const achievements = {
    firstBlood: false,
    survivor: false,
    comboMaster: false,
    bossSlayer: false,
    sharpShooter: false
};

// ========================================
// NO LOGIN SYSTEM - ANYONE CAN PLAY
// ========================================

// Simple data storage (no user accounts)
let currentUser = null; // Removed login system - keeping variable to avoid errors
let highScore = localStorage.getItem('neonSurvival_highScore') || 0;
let leaderboard = [];
let difficulty = localStorage.getItem('neonSurvivalDifficulty') || 'normal';
let perks = { maxHealth: 0, damage: 0, speed: 0, luck: 0 };

// Empty stub functions to avoid errors (login system removed)
function saveUserData() { /* No-op - login removed */ }
function loadUserData() { return null; }
function checkUserApproval() { return true; }
function updateUserDisplay() { /* No-op - login removed */ }

// Shop System
let shopUpgrades = {
    weaponDamage: 0,
    fireRate: 0,
    bulletSpeed: 0,
    shieldDuration: 0,
    dashCooldown: 0,
    ultimateCharge: 0,
    maxHealth: 0,
    movementSpeed: 0,
    luck: 0
};

// Sound Effects (Simple beep sounds using Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function shootSound() { 
    playSound(900, 0.04, 'square'); 
    playSound(1200, 0.03, 'sine'); // Layered sound for realistic effect
}
function hitSound() { 
    playSound(400, 0.1, 'sawtooth'); 
    playSound(200, 0.08, 'square'); // Impact sound
}
function powerUpSound() { playSound(600, 0.2, 'sine'); }
function achievementSound() { playSound(1000, 0.3, 'triangle'); }
function bossSound() { playSound(200, 0.5, 'sawtooth'); }

// Background music
let musicOscillator = null;
let musicGain = null;
let musicPlaying = false;

function startBackgroundMusic() {
    if (!soundEnabled || musicPlaying) return;
    musicPlaying = true;
    
    musicOscillator = audioContext.createOscillator();
    musicGain = audioContext.createGain();
    
    musicOscillator.connect(musicGain);
    musicGain.connect(audioContext.destination);
    
    musicOscillator.frequency.value = 220;
    musicOscillator.type = 'sine';
    musicGain.gain.setValueAtTime(0.02, audioContext.currentTime);
    
    musicOscillator.start();
}

function stopBackgroundMusic() {
    if (musicOscillator) {
        musicOscillator.stop();
        musicOscillator = null;
        musicPlaying = false;
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    if (!soundEnabled) {
        stopBackgroundMusic();
    } else {
        startBackgroundMusic();
    }
}

// ========================================
// AI SMOOTH MOVEMENT - EASING FUNCTIONS
// ========================================

// Easing function for smooth acceleration (ease-out cubic)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Easing function for smooth deceleration (ease-in-out)
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// AI-based smooth interpolation (lerp with easing)
function smoothLerp(current, target, factor, easing = true) {
    const diff = target - current;
    if (Math.abs(diff) < 0.01) return target;
    
    if (easing) {
        const t = Math.min(Math.abs(diff) / 100, 1);
        const easedFactor = easeInOutQuad(t) * factor + factor * 0.5;
        return current + diff * easedFactor;
    }
    return current + diff * factor;
}

// ========================================
// INPUT HANDLERS
// ========================================

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "Enter" && !isRunning && !isGameOver) startGame();
    if (e.key === " " && isRunning && !isGameOver) {
        togglePause();
        e.preventDefault();
    }
    // Dash ability (Shift)
    if (e.key === "Shift" && isRunning && !isPaused && player.dashCooldown === 0) {
        activateDash();
    }
    // Ultimate ability (Q)
    if (e.key === "q" || e.key === "Q") {
        if (isRunning && !isPaused && player.ultimateCharge >= 100) {
            activateUltimate();
        }
    }
    // Upgrade weapon (U key)
    if (e.key === "u" || e.key === "U") {
        if (isRunning && !isPaused) {
            upgradeWeapon();
        }
    }
    // Toggle sound (M key)
    if (e.key === "m" || e.key === "M") {
        toggleSound();
        showFloatingText(canvas.width / 2, 50, soundEnabled ? "🔊 SOUND ON" : "🔇 SOUND OFF", "#ffff00", 40);
    }
    // Change weapon (1-4 keys)
    if (e.key >= "1" && e.key <= "4" && isRunning && !isPaused) {
        const weapons = ['normal', 'laser', 'shotgun', 'sniper'];
        player.weaponType = weapons[parseInt(e.key) - 1];
        showFloatingText(player.x, player.y - 40, `🔫 ${player.weaponType.toUpperCase()}`, "#00ffff", 40);
        updateWeaponHUD();
    }
});

// Weapon slot clicks
document.querySelectorAll('.weapon-slot').forEach((slot, index) => {
    slot.addEventListener('click', () => {
        if (!isRunning || isPaused) return;
        const weapons = ['normal', 'laser', 'shotgun', 'sniper'];
        player.weaponType = weapons[index];
        showFloatingText(player.x, player.y - 40, `🔫 ${player.weaponType.toUpperCase()}`, "#00ffff", 40);
        updateWeaponHUD();
    });
});

// Ability button clicks
const dashBtnUI = document.getElementById('dashBtnUI');
const ultBtnUI = document.getElementById('ultBtnUI');

if (dashBtnUI) {
    dashBtnUI.addEventListener('click', () => {
        if (isRunning && !isPaused && player.dashCooldown === 0) {
            activateDash();
        }
    });
    dashBtnUI.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isRunning && !isPaused && player.dashCooldown === 0) {
            activateDash();
        }
    });
}

if (ultBtnUI) {
    ultBtnUI.addEventListener('click', () => {
        if (isRunning && !isPaused && player.ultimateCharge >= 100) {
            activateUltimate();
        }
    });
    ultBtnUI.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isRunning && !isPaused && player.ultimateCharge >= 100) {
            activateUltimate();
        }
    });
}

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    mouseDown = true;
});

canvas.addEventListener("mouseup", () => {
    mouseDown = false;
});

// Touch events for mobile - Touch rocket to drag left/right
let touchingRocket = false;
let touchStartX = 0;
let touchStartPlayerX = 0;

canvas.addEventListener("touchstart", (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Check if touching the rocket
    const dx = touchX - player.x;
    const dy = touchY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < player.size * 3) {
        // Touching rocket - enable drag mode
        touchingRocket = true;
        touchStartX = touchX;
        touchStartPlayerX = player.x;
    }
    
    mouseDown = true;
});

canvas.addEventListener("touchmove", (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    e.preventDefault();
    
    if (touchingRocket) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        
        // Calculate drag distance
        const dragDelta = touchX - touchStartX;
        
        // Move player by drag amount
        player.targetX = touchStartPlayerX + dragDelta;
        player.x = player.targetX;
        
        // Keep within bounds
        player.x = Math.max(player.size * 2, Math.min(canvas.width - player.size * 2, player.x));
    }
});

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    touchingRocket = false;
    mouseDown = false;
});

// ========================================
// NO LOGIN - DIRECT PLAY
// ========================================

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => document.location.reload());
perksBtn.addEventListener("click", showPerksMenu);

difficultySelect.addEventListener("change", (e) => {
    difficulty = e.target.value;
    localStorage.setItem('neonSurvivalDifficulty', difficulty);
});

// Set saved difficulty
difficultySelect.value = difficulty;

// Logout Button - REMOVED (No login system)

// ========================================
// SHOP SYSTEM
// ========================================

// Open Shop
shopBtn.addEventListener("click", () => {
    openShop();
});

// Close Shop
closeShopBtn.addEventListener("click", () => {
    closeShop();
});

// ========================================
// STATISTICS SYSTEM
// ========================================

// Open Stats
statsBtn.addEventListener("click", () => {
    openStats();
});

// Close Stats
closeStatsBtn.addEventListener("click", () => {
    closeStats();
});

function openStats() {
    statsScreen.classList.remove('hidden');
    updateStatsDisplay();
}

function closeStats() {
    statsScreen.classList.add('hidden');
}

function updateStatsDisplay() {
    if (!currentUser) return;
    
    // Basic stats
    document.getElementById('totalGames').textContent = currentUser.totalGamesPlayed || 0;
    document.getElementById('totalKillsStat').textContent = currentUser.totalKills || 0;
    document.getElementById('highScoreStat').textContent = currentUser.highScore || 0;
    document.getElementById('maxLevelStat').textContent = currentUser.maxUnlockedLevel || 1;
    document.getElementById('maxStreakStat').textContent = currentUser.maxKillStreak || 0;
    document.getElementById('totalCoinsStat').textContent = currentUser.totalCoinsEarned || 0;
    
    // Play time (convert seconds to minutes)
    const minutes = Math.floor((currentUser.totalPlayTime || 0) / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    document.getElementById('totalTime').textContent = hours > 0 
        ? `${hours}h ${remainingMins}m` 
        : `${minutes}m`;
    
    // Accuracy
    const totalShots = currentUser.totalShots || 0;
    const totalHits = currentUser.totalHits || 0;
    const accuracy = totalShots > 0 ? ((totalHits / totalShots) * 100).toFixed(1) : 0;
    document.getElementById('accuracyStat').textContent = `${accuracy}%`;
    
    // K/D Ratio
    const deaths = currentUser.totalDeaths || 1;
    const kdRatio = ((currentUser.totalKills || 0) / deaths).toFixed(2);
    document.getElementById('kdRatio').textContent = kdRatio;
    
    // Average Score
    const avgScore = currentUser.totalGamesPlayed > 0 
        ? Math.floor((currentUser.highScore || 0) / currentUser.totalGamesPlayed)
        : 0;
    document.getElementById('avgScore').textContent = avgScore;
    
    // Favorite Weapon
    const weaponUsage = currentUser.weaponUsage || { normal: 0, laser: 0, shotgun: 0, sniper: 0 };
    let favoriteWeapon = 'Normal';
    let maxUsage = 0;
    
    for (const [weapon, usage] of Object.entries(weaponUsage)) {
        if (usage > maxUsage) {
            maxUsage = usage;
            favoriteWeapon = weapon.charAt(0).toUpperCase() + weapon.slice(1);
        }
    }
    
    document.getElementById('favoriteWeapon').textContent = favoriteWeapon;
}

// ========================================
// DAILY CHALLENGES SYSTEM
// ========================================

// Challenge Templates
const challengeTemplates = [
    { id: 'kills', icon: '💀', title: 'Enemy Hunter', desc: 'Eliminate {target} enemies', target: [20, 30, 50], reward: [100, 150, 200], gems: [1, 2, 3] },
    { id: 'score', icon: '🎯', title: 'Score Master', desc: 'Reach a score of {target}', target: [5000, 10000, 15000], reward: [120, 180, 250], gems: [1, 2, 3] },
    { id: 'survive', icon: '⏱️', title: 'Survivor', desc: 'Survive for {target} seconds', target: [120, 180, 300], reward: [100, 150, 200], gems: [1, 2, 3] },
    { id: 'combo', icon: '🔥', title: 'Combo King', desc: 'Achieve a {target}x combo', target: [10, 15, 20], reward: [80, 120, 180], gems: [1, 2, 2] },
    { id: 'accuracy', icon: '🎯', title: 'Sharpshooter', desc: 'Hit {target}% accuracy in a game', target: [60, 70, 80], reward: [150, 200, 300], gems: [2, 3, 4] },
    { id: 'noDamage', icon: '🛡️', title: 'Untouchable', desc: 'Survive {target} seconds without taking damage', target: [30, 60, 90], reward: [200, 300, 400], gems: [3, 4, 5] },
    { id: 'wave', icon: '🌊', title: 'Wave Warrior', desc: 'Complete wave {target}', target: [5, 10, 15], reward: [100, 200, 300], gems: [1, 3, 5] },
    { id: 'powerups', icon: '💎', title: 'Collector', desc: 'Collect {target} power-ups', target: [5, 10, 15], reward: [80, 120, 180], gems: [1, 2, 3] }
];

// Open Challenges
challengesBtn.addEventListener("click", () => {
    openChallenges();
});

// Close Challenges
closeChallengesBtn.addEventListener("click", () => {
    closeChallenges();
});

function openChallenges() {
    challengesScreen.classList.remove('hidden');
    checkAndResetChallenges();
    updateChallengesDisplay();
    startChallengeTimer();
}

function closeChallenges() {
    challengesScreen.classList.add('hidden');
}

function checkAndResetChallenges() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    
    // Initialize if doesn't exist
    if (!currentUser.dailyChallenges) {
        currentUser.dailyChallenges = {
            lastReset: today,
            challenges: [],
            completedToday: []
        };
    }
    
    // Reset if new day
    if (currentUser.dailyChallenges.lastReset !== today) {
        currentUser.dailyChallenges = {
            lastReset: today,
            challenges: generateDailyChallenges(),
            completedToday: []
        };
        saveUserData();
    }
    
    // Generate if empty
    if (currentUser.dailyChallenges.challenges.length === 0) {
        currentUser.dailyChallenges.challenges = generateDailyChallenges();
        saveUserData();
    }
}

function generateDailyChallenges() {
    // Generate 3 random challenges
    const shuffled = [...challengeTemplates].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    
    return selected.map(template => {
        const difficulty = Math.floor(Math.random() * 3); // 0=easy, 1=medium, 2=hard
        return {
            id: template.id,
            icon: template.icon,
            title: template.title,
            desc: template.desc.replace('{target}', template.target[difficulty]),
            target: template.target[difficulty],
            progress: 0,
            completed: false,
            reward: template.reward[difficulty],
            gems: template.gems[difficulty]
        };
    });
}

function updateChallengesDisplay() {
    if (!currentUser || !currentUser.dailyChallenges) return;
    
    const challenges = currentUser.dailyChallenges.challenges;
    
    challenges.forEach((challenge, index) => {
        const cardNum = index + 1;
        const card = document.getElementById(`challenge${cardNum}`);
        
        // Update icon
        card.querySelector('.challenge-icon').textContent = challenge.icon;
        
        // Update status
        const statusIcon = card.querySelector('.challenge-status');
        statusIcon.textContent = challenge.completed ? '✅' : '⏳';
        
        // Update title and description
        card.querySelector('.challenge-title').textContent = challenge.title;
        card.querySelector('.challenge-desc').textContent = challenge.desc;
        
        // Update progress
        const progressPercent = Math.min((challenge.progress / challenge.target) * 100, 100);
        document.getElementById(`progress${cardNum}`).style.width = `${progressPercent}%`;
        document.getElementById(`progressText${cardNum}`).textContent = `${challenge.progress}/${challenge.target}`;
        
        // Update rewards
        document.getElementById(`reward${cardNum}`).textContent = challenge.reward;
        document.getElementById(`rewardGem${cardNum}`).textContent = challenge.gems;
        
        // Mark as completed
        if (challenge.completed) {
            card.classList.add('completed');
        } else {
            card.classList.remove('completed');
        }
    });
}

let challengeTimerInterval = null;

function startChallengeTimer() {
    updateChallengeTimer();
    if (!challengeTimerInterval) {
        challengeTimerInterval = setInterval(updateChallengeTimer, 1000);
    }
}

function updateChallengeTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    challengeTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateChallengeProgress(type, value) {
    if (!currentUser || !currentUser.dailyChallenges) return;
    
    let updated = false;
    
    currentUser.dailyChallenges.challenges.forEach(challenge => {
        if (challenge.id === type && !challenge.completed) {
            challenge.progress = Math.max(challenge.progress, value);
            
            // Check if completed
            if (challenge.progress >= challenge.target) {
                challenge.completed = true;
                challenge.progress = challenge.target;
                
                // Award rewards
                player.coins += challenge.reward;
                player.gems += challenge.gems;
                currentUser.coins += challenge.reward;
                currentUser.gems += challenge.gems;
                
                // Show notification
                showChallengeComplete(challenge);
                
                updated = true;
            }
        }
    });
    
    if (updated) {
        saveUserData();
    }
}

function showChallengeComplete(challenge) {
    achievementText.textContent = `🎯 Challenge Complete! ${challenge.title} - Earned 💰${challenge.reward} 💎${challenge.gems}`;
    achievementBox.classList.remove("hidden");
    setTimeout(() => {
        achievementBox.classList.add("hidden");
    }, 4000);
}

// Shop Tab Switching
document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchShopTab(tabName);
    });
});

// Buy Button Handlers
document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const item = e.target.closest('.shop-item').dataset.item;
        const cost = parseInt(e.target.dataset.cost);
        const type = e.target.dataset.type;
        buyUpgrade(item, cost, type);
    });
});

function openShop() {
    shopScreen.classList.remove('hidden');
    updateShopDisplay();
}

function closeShop() {
    shopScreen.classList.add('hidden');
}

function switchShopTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateShopDisplay() {
    // Update balance
    shopCoins.textContent = `💰 ${player.coins}`;
    shopGems.textContent = `💎 ${player.gems}`;
    
    // Update upgrade levels
    document.getElementById('damage-level').textContent = shopUpgrades.weaponDamage;
    document.getElementById('firerate-level').textContent = shopUpgrades.fireRate;
    document.getElementById('bulletspeed-level').textContent = shopUpgrades.bulletSpeed;
    document.getElementById('shield-level').textContent = shopUpgrades.shieldDuration;
    document.getElementById('dash-level').textContent = shopUpgrades.dashCooldown;
    document.getElementById('ultimate-level').textContent = shopUpgrades.ultimateCharge;
    document.getElementById('health-level').textContent = shopUpgrades.maxHealth;
    document.getElementById('speed-level').textContent = shopUpgrades.movementSpeed;
    document.getElementById('luck-level').textContent = shopUpgrades.luck;
    
    // Update buy buttons
    document.querySelectorAll('.buy-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        const type = btn.dataset.type;
        const canAfford = type === 'coins' ? player.coins >= cost : player.gems >= cost;
        btn.disabled = !canAfford;
    });
}

function buyUpgrade(item, cost, type) {
    // Check if can afford
    if (type === 'coins' && player.coins < cost) {
        showFloatingText(canvas.width / 2, canvas.height / 2, "Not enough coins!", "#ff0000", 60);
        return;
    }
    if (type === 'gems' && player.gems < cost) {
        showFloatingText(canvas.width / 2, canvas.height / 2, "Not enough gems!", "#ff0000", 60);
        return;
    }
    
    // Deduct cost
    if (type === 'coins') {
        player.coins -= cost;
    } else {
        player.gems -= cost;
    }
    
    // Apply upgrade
    switch(item) {
        case 'weapon-damage':
            shopUpgrades.weaponDamage++;
            break;
        case 'fire-rate':
            shopUpgrades.fireRate++;
            break;
        case 'bullet-speed':
            shopUpgrades.bulletSpeed++;
            break;
        case 'shield-duration':
            shopUpgrades.shieldDuration++;
            break;
        case 'dash-cooldown':
            shopUpgrades.dashCooldown++;
            break;
        case 'ultimate-charge':
            shopUpgrades.ultimateCharge++;
            break;
        case 'max-health':
            shopUpgrades.maxHealth++;
            player.maxHealth++;
            player.health = Math.min(player.health + 1, player.maxHealth);
            break;
        case 'movement-speed':
            shopUpgrades.movementSpeed++;
            player.speed += 0.3;
            break;
        case 'luck':
            shopUpgrades.luck++;
            player.critChance += 0.05;
            break;
    }
    
    // Save to user data
    if (currentUser) {
        currentUser.shopUpgrades = shopUpgrades;
        currentUser.coins = player.coins;
        currentUser.gems = player.gems;
        saveUserData();
    }
    
    // Play sound and show message
    powerUpSound();
    showFloatingText(canvas.width / 2, canvas.height / 2, "✅ Upgrade Purchased!", "#00ff00", 60);
    
    // Update display
    updateShopDisplay();
}

// No login - Game ready to play
window.addEventListener('load', () => {
    console.log('🎮 Game loaded - Ready to play!');
    // Start screen is already visible in HTML
});

// ========================================
// MOBILE TOUCH CONTROLS - REMOVED
// Now using direct touch-to-drag rocket control
// ========================================

// Detect if mobile device
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

function startGame() {
    // Reset game state
    isRunning = true;
    isPaused = false;
    isGameOver = false;
    gameTime = 0;
    score = 0;
    combo = 1;
    comboTimer = 0;
    wave = 1;
    enemiesKilled = 0;
    bossActive = false;
    slowMotion = false;
    slowMotionTimer = 0;
    screenShake = 0;
    
    // Reset challenge tracking
    noDamageTime = 0;
    maxNoDamageTime = 0;
    if (currentUser) {
        currentUser.powerUpsCollected = 0;
    }
    
    // Load saved level or start from level 1
    if (currentUser && currentUser.currentLevel) {
        currentLevel = currentUser.currentLevel;
        maxUnlockedLevel = currentUser.maxUnlockedLevel || currentLevel;
        completedLevels = currentUser.completedLevels || [];
    } else {
        currentLevel = 1;
        maxUnlockedLevel = 1;
        completedLevels = [];
    }
    
    levelProgress = 0;
    // Progressive enemy requirement - matches levelUp calculation
    enemiesRequiredForLevel = Math.floor(10 + (currentLevel * 7) + Math.pow(currentLevel, 1.3));
    levelTransitioning = false;
    levelTransitionTimer = 0;
    
    // Reset timers
    spawnTimer = 0;
    spawnInterval = 300; // SUPER slow spawning
    powerUpTimer = 0;
    
    // Clear arrays
    enemies.length = 0;
    bullets.length = 0;
    hitParticles.length = 0;
    powerUps.length = 0;
    floatingTexts.length = 0;
    drops.length = 0;
    explosions.length = 0;
    
    // Reset player
    player.x = canvas.width / 2;
    player.y = canvas.height - 50; // Bottom of screen
    player.vx = 0;
    player.vy = 0;
    player.maxHealth = 8 + perks.maxHealth;
    player.health = player.maxHealth;
    player.speed = 3.0 + (perks.speed * 0.3); // Slower for better control
    player.critChance = 0.25 + (perks.luck * 0.05);
    player.invincible = false;
    player.invincibleTimer = 0;
    player.shield = false;
    player.shieldTimer = 0;
    player.speedBoost = false;
    player.speedBoostTimer = 0;
    player.rapidFire = false;
    player.rapidFireTimer = 0;
    player.shootCooldown = 0;
    player.coins = 0;
    player.gems = 0;
    player.dashCooldown = 0;
    player.dashDuration = 0;
    player.ultimateCooldown = 0;
    player.ultimateCharge = 0;
    player.weaponLevel = 1;
    player.killStreak = 0;
    player.maxKillStreak = 0;
    player.weaponType = 'normal';
    
    // UI updates
    startScreen.classList.add("hidden");
    weaponHUD.classList.remove("hidden");
    document.getElementById("abilityButtons").classList.remove("hidden");
    gameOverScreen.classList.add("hidden");
    
    // Mobile controls removed - using direct touch-to-drag
    
    startBackgroundMusic();
    updateWeaponHUD();
}

// Perks Screen Elements
const perksScreen = document.getElementById("perksScreen");
const closePerksBtn = document.getElementById("closePerksBtn");
const perksGems = document.getElementById("perksGems");

// Open Perks
function showPerksMenu() {
    openPerks();
}

function openPerks() {
    perksScreen.classList.remove('hidden');
    updatePerksDisplay();
}

function closePerks() {
    perksScreen.classList.add('hidden');
}

function updatePerksDisplay() {
    // Update gems balance
    perksGems.textContent = `💎 ${player.gems || 0} Gems`;
    
    // Update perk levels
    document.getElementById('perk-health-level').textContent = perks.maxHealth || 0;
    document.getElementById('perk-damage-level').textContent = perks.damage || 0;
    document.getElementById('perk-speed-level').textContent = perks.speed || 0;
    document.getElementById('perk-luck-level').textContent = perks.luck || 0;
    
    // Update buy buttons
    document.querySelectorAll('.perk-buy-btn').forEach(btn => {
        const cost = parseInt(btn.dataset.cost);
        const perkType = btn.dataset.perk;
        const currentLevel = perks[perkType] || 0;
        
        // Disable if can't afford or max level
        btn.disabled = (player.gems < cost) || (currentLevel >= 10);
        
        // Update button text
        if (currentLevel >= 10) {
            btn.textContent = 'MAX';
        } else {
            btn.textContent = `💎 ${cost}`;
        }
    });
}

function buyPerk(perkType, cost) {
    // Check if can afford
    if (player.gems < cost) {
        showFloatingText(canvas.width / 2, canvas.height / 2, "Not enough gems!", "#ff0000", 60);
        return;
    }
    
    // Check max level
    if (perks[perkType] >= 10) {
        showFloatingText(canvas.width / 2, canvas.height / 2, "Max level reached!", "#ffaa00", 60);
        return;
    }
    
    // Deduct cost
    player.gems -= cost;
    
    // Upgrade perk
    perks[perkType]++;
    
    // Apply perk effects
    if (perkType === 'maxHealth') {
        player.maxHealth++;
        player.health = Math.min(player.health + 1, player.maxHealth);
    } else if (perkType === 'speed') {
        player.speed += 0.3;
    } else if (perkType === 'luck') {
        player.critChance += 0.05;
    }
    
    // Save to user data
    if (currentUser) {
        currentUser.perks = perks;
        currentUser.gems = player.gems;
        saveUserData();
    }
    
    // Play sound and show message
    powerUpSound();
    showFloatingText(canvas.width / 2, canvas.height / 2, `✅ ${perkType.toUpperCase()} +1!`, "#00ff00", 60);
    
    // Update display
    updatePerksDisplay();
}

// Close Perks Button
closePerksBtn.addEventListener("click", () => {
    closePerks();
});

// Perk Buy Button Handlers
document.querySelectorAll('.perk-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const perkType = e.target.dataset.perk;
        const cost = parseInt(e.target.dataset.cost);
        buyPerk(perkType, cost);
    });
});

function updateWeaponHUD() {
    const slots = document.querySelectorAll('.weapon-slot');
    slots.forEach((slot, index) => {
        const weapons = ['normal', 'laser', 'shotgun', 'sniper'];
        if (weapons[index] === player.weaponType) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    });
}

function togglePause() {
    isPaused = !isPaused;
    pauseBanner.classList.toggle("hidden", !isPaused);
}

// ========================================
// PLAYER FUNCTIONS
// ========================================

function updatePlayer() {
    // AI-BASED SMOOTH MOVEMENT with Easing
    const maxSpeed = player.speedBoost ? player.speed * 2 : player.speed;
    const acceleration = 0.35;
    const friction = 0.88;
    
    // Calculate target velocity based on input
    let targetVx = 0;
    
    // Keyboard controls - SIRF LEFT-RIGHT (HORIZONTAL ONLY)!
    if (keys["ArrowLeft"] || keys["a"]) {
        targetVx = -maxSpeed;
    } else if (keys["ArrowRight"] || keys["d"]) {
        targetVx = maxSpeed;
    }
    
    // Mobile touch controls handled directly in touch events
    // No joystick needed - player drags rocket directly
    
    // AI Smooth interpolation with easing
    if (targetVx !== 0) {
        // Accelerating - use easing for smooth start
        const diff = targetVx - player.vx;
        const easingFactor = easeOutCubic(Math.min(Math.abs(player.vx / maxSpeed), 1));
        player.vx += diff * (acceleration + easingFactor * 0.15);
    } else {
        // Decelerating - smooth friction with easing
        const currentSpeed = Math.abs(player.vx);
        const easingFactor = easeInOutQuad(currentSpeed / maxSpeed);
        player.vx *= (friction + easingFactor * 0.08);
        
        // Complete stop when very slow
        if (Math.abs(player.vx) < 0.03) player.vx = 0;
    }
    
    // Clamp velocity to max speed
    player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
    
    // Dash boost with smooth multiplier
    if (player.dashDuration > 0) {
        const dashEasing = easeOutCubic(player.dashDuration / 20);
        player.vx *= (1.5 + dashEasing * 1.5);
    }
    
    // AI Smooth position update with sub-pixel precision
    const oldX = player.x;
    player.targetX = player.x + player.vx;
    player.x = smoothLerp(player.x, player.targetX, 0.85, true);
    
    // Add micro-movements for visual smoothness
    const microShift = Math.sin(gameTime * 0.1) * 0.15;
    player.x += microShift * (Math.abs(player.vx) / maxSpeed);
    
    // Keep player within screen bounds (horizontal only)
    player.x = Math.max(player.size * 2, Math.min(canvas.width - player.size * 2, player.x));
    
    // Y position ko fixed rakhte hain bottom pe with subtle floating effect
    const floatEffect = Math.sin(gameTime * 0.05) * 1.5;
    player.y = canvas.height - 50 + floatEffect;
    
    // Update power-up timers
    if (player.invincibleTimer > 0) {
        player.invincibleTimer--;
        if (player.invincibleTimer === 0) player.invincible = false;
    }
    
    if (player.shieldTimer > 0) {
        player.shieldTimer--;
        if (player.shieldTimer === 0) player.shield = false;
    }
    
    if (player.speedBoostTimer > 0) {
        player.speedBoostTimer--;
        if (player.speedBoostTimer === 0) player.speedBoost = false;
    }
    
    if (player.rapidFireTimer > 0) {
        player.rapidFireTimer--;
        if (player.rapidFireTimer === 0) player.rapidFire = false;
    }
    
    // New temporary power-up timers
    if (player.tempDamageTimer > 0) {
        player.tempDamageTimer--;
        if (player.tempDamageTimer === 0) player.tempDamageBoost = false;
    }
    
    if (player.tempMultiShotTimer > 0) {
        player.tempMultiShotTimer--;
        if (player.tempMultiShotTimer === 0) player.tempMultiShot = false;
    }
    
    if (player.shootCooldown > 0) player.shootCooldown--;
    
    // Dash cooldown
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (player.dashDuration > 0) {
        player.dashDuration--;
        player.invincible = true;
    }
    
    // Ultimate cooldown
    if (player.ultimateCooldown > 0) player.ultimateCooldown--;
    
    // AUTO-FIRING - Continuously shoot!
    if (player.shootCooldown === 0) {
        shootBullet();
        let cooldown = player.rapidFire ? 4 : 10; // Smooth firing rate
        cooldown = Math.max(3, cooldown - player.weaponLevel);
        player.shootCooldown = cooldown;
    }
}

// ========================================
// SHOOTING SYSTEM
// ========================================

function shootBullet() {
    // AUTO-AIM - Find nearest enemy
    let targetX = player.x;
    let targetY = 0; // Shoot upwards by default
    let nearestDist = Infinity;
    
    for (let enemy of enemies) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < nearestDist) {
            nearestDist = dist;
            targetX = enemy.x;
            targetY = enemy.y;
        }
    }
    
    // Calculate direction
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;
    const angle = Math.atan2(dirY, dirX);
    
    shootSound();
    
    // Track shot for stats
    if (currentUser) {
        if (!currentUser.totalShots) currentUser.totalShots = 0;
        currentUser.totalShots++;
        
        // Track weapon usage
        if (!currentUser.weaponUsage) currentUser.weaponUsage = { normal: 0, laser: 0, shotgun: 0, sniper: 0 };
        currentUser.weaponUsage[player.weaponType]++;
    }
    
    const bulletSpeed = 10 + player.weaponLevel * 0.3; // Smooth bullet speed!
    const bulletSize = 6 + player.weaponLevel * 0.2; // Medium bullets
    const baseDamage = 3 + Math.floor(player.weaponLevel / 2) + perks.damage; // TRIPLE damage!
    const isCrit = Math.random() < player.critChance;
    const damage = isCrit ? baseDamage * player.critMultiplier : baseDamage;
    
    // Crit text removed - no floating text on crit
    // if (isCrit) {
    //     showFloatingText(player.x, player.y - 20, "💥 CRIT!", "#ff0000", 20);
    // }
    
    // Weapon types
    if (player.weaponType === 'shotgun') {
        // Shotgun - 5 bullets spread
        for (let i = -2; i <= 2; i++) {
            const spread = i * 0.2;
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle + spread) * (bulletSpeed * 0.8),
                vy: Math.sin(angle + spread) * (bulletSpeed * 0.8),
                size: bulletSize * 0.8,
                life: 40,
                trail: [],
                damage: damage * 0.6,
                color: '#ff9800',
                isCrit
            });
        }
    } else if (player.weaponType === 'laser') {
        // Laser - Fast, piercing
        bullets.push({
            x: player.x,
            y: player.y,
            vx: dirX * (bulletSpeed * 2),
            vy: dirY * (bulletSpeed * 2),
            size: bulletSize * 0.5,
            life: 80,
            trail: [],
            damage: damage * 0.8,
            piercing: true,
            color: '#00ffff',
            isCrit
        });
    } else if (player.weaponType === 'sniper') {
        // Sniper - Slow, high damage
        bullets.push({
            x: player.x,
            y: player.y,
            vx: dirX * (bulletSpeed * 1.5),
            vy: dirY * (bulletSpeed * 1.5),
            size: bulletSize * 1.5,
            life: 100,
            trail: [],
            damage: damage * 2.5,
            color: '#ff00ff',
            isCrit
        });
    } else {
        // Normal bullet
        bullets.push({
            x: player.x,
            y: player.y,
            vx: dirX * bulletSpeed,
            vy: dirY * bulletSpeed,
            size: bulletSize,
            life: 60,
            trail: [],
            damage: damage,
            color: '#76ff03',
            isCrit
        });
        
        // Weapon upgrades
        if (player.weaponLevel >= 3) {
            // Dual shot
            const spread = 0.15;
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle + spread) * bulletSpeed,
                vy: Math.sin(angle + spread) * bulletSpeed,
                size: bulletSize,
                life: 60,
                trail: [],
                damage: damage,
                color: '#76ff03',
                isCrit
            });
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle - spread) * bulletSpeed,
                vy: Math.sin(angle - spread) * bulletSpeed,
                size: bulletSize,
                life: 60,
                trail: [],
                damage: damage,
                color: '#76ff03',
                isCrit
            });
        }
        
        // Triple shot if rapid fire
        if (player.rapidFire) {
            const spread = 0.3;
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle + spread) * bulletSpeed,
                vy: Math.sin(angle + spread) * bulletSpeed,
                size: bulletSize,
                life: 60,
                trail: [],
                damage: damage,
                color: '#76ff03',
                isCrit
            });
            bullets.push({
                x: player.x,
                y: player.y,
                vx: Math.cos(angle - spread) * bulletSpeed,
                vy: Math.sin(angle - spread) * bulletSpeed,
                size: bulletSize,
                life: 60,
                trail: [],
                damage: damage,
                color: '#76ff03',
                isCrit
            });
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        
        // AI Smooth bullet movement with acceleration
        if (!b.accelerated) {
            b.accelerated = 0;
        }
        
        // Smooth acceleration for bullets (starts slow, gets faster)
        b.accelerated = Math.min(b.accelerated + 0.08, 1);
        const speedMultiplier = 0.5 + easeOutCubic(b.accelerated) * 0.5;
        
        // Update position with smooth movement
        b.x += b.vx * speedMultiplier;
        b.y += b.vy * speedMultiplier;
        
        // Add slight wave effect for visual interest
        const waveEffect = Math.sin(b.life * 0.2) * 0.3;
        b.x += waveEffect;
        
        b.life--;
        
        if (b.life <= 0 || b.x < -10 || b.x > canvas.width + 10 || 
            b.y < -10 || b.y > canvas.height + 10) {
            bullets.splice(i, 1);
        }
    }
}

// ========================================
// ENEMY SYSTEM
// ========================================

function spawnEnemy(isBoss = false) {
    // Enemies sirf UPAR se aayenge!
    let x = Math.random() * canvas.width;
    let y = -20;
    
    // Difficulty multipliers - WITH LEVEL SCALING!
    const diffMultiplier = difficulty === 'easy' ? 0.3 : (difficulty === 'hard' ? 0.8 : 0.5);
    const levelMultiplier = getLevelDifficultyMultiplier(); // AI-based scaling!
    
    if (isBoss) {
        bossSound();
        showFloatingText(canvas.width / 2, 100, `⚠ LEVEL ${currentLevel} BOSS ⚠`, "#ff0000", 60);
        const bossHP = Math.floor(15 * diffMultiplier * levelMultiplier * 20); // 20x HP for boss!
        enemies.push({
            x, y,
            size: 70, // 2x size (was 35)
            speed: ((2 + getLevelSpeedBonus()) * diffMultiplier) * 0.25, // 0.25x boss speed
            angle: Math.random() * Math.PI * 2,
            type: "boss",
            hp: bossHP,
            maxHp: bossHP,
            isBoss: true
        });
        return;
    }
    
    const baseSpeed = 0.0875; // 0.25x slower - quarter speed!
    const difficultyBoost = Math.min(gameTime / 8000, 0.075); // 0.25x slower progression
    const levelSpeedBonus = getLevelSpeedBonus() * 0.125; // 0.25x slower level bonus
    const speed = (baseSpeed + difficultyBoost + levelSpeedBonus) * diffMultiplier;
    
    const rand = Math.random();
    let type = "chaser";
    
    if (rand > 0.65 && rand <= 0.8) type = "zigzag";
    else if (rand > 0.8 && rand <= 0.9) type = "orbiter";
    else if (rand > 0.9 && rand <= 0.95) type = "sprinter";
    else if (rand > 0.95 && rand <= 0.98) type = "tank"; // New
    else if (rand > 0.98) type = "teleporter"; // New
    
    // Base HP with LEVEL SCALING - 20x HP!
    let hp = (1 + getLevelHPBonus()) * 20; // 20x HP increase!
    if (type === "orbiter") hp = (2 + getLevelHPBonus()) * 20;
    else if (type === "sprinter") hp = (1 + Math.floor(getLevelHPBonus() * 0.5)) * 20;
    else if (type === "tank") hp = (4 + getLevelHPBonus() * 2) * 20;
    else if (type === "teleporter") hp = (1 + getLevelHPBonus()) * 20;
    
    enemies.push({
        x, y,
        size: type === "sprinter" ? 20 : (type === "tank" ? 36 : 26), // 2x size (was 10, 18, 13)
        speed: type === "sprinter" ? speed + 2.5 : (type === "tank" ? speed * 0.5 : speed),
        angle: Math.random() * Math.PI * 2,
        type,
        hp: Math.floor(hp * diffMultiplier),
        maxHp: Math.floor(hp * diffMultiplier),
        isBoss: false,
        teleportTimer: 0
    });
}

function updateEnemies() {
    for (let enemy of enemies) {
        // SAB ENEMIES SEEDHA NEECHE KI TARAF AAYENGE!
        let dirX = 0; // No horizontal movement
        let dirY = 1; // Straight down!
        
        // Different enemy types have different patterns
        if (enemy.type === "zigzag") {
            // Zigzag - left-right movement while going down
            const offset = Math.sin(gameTime * 0.15 + enemy.x * 0.02);
            dirX = offset * 0.5; // Side to side movement
            dirY = 1; // Still going down
        } else if (enemy.type === "orbiter") {
            // Orbiter - slight circular movement while going down
            enemy.angle += 0.08;
            dirX = Math.cos(enemy.angle) * 0.3;
            dirY = 1; // Going down
        } else if (enemy.type === "chaser") {
            // Chaser - tries to follow player horizontally while going down
            const dx = player.x - enemy.x;
            dirX = Math.sign(dx) * Math.min(Math.abs(dx) / 200, 0.4); // Slow horizontal chase
            dirY = 1; // Going down
        } else if (enemy.type === "boss") {
            // Boss - slow zigzag pattern
            enemy.angle += 0.03;
            dirX = Math.sin(enemy.angle) * 0.6;
            dirY = 0.8; // Slower downward movement
        } else if (enemy.type === "tank") {
            // Tank - straight down, no deviation
            dirX = 0;
            dirY = 1;
        } else if (enemy.type === "sprinter") {
            // Sprinter - fast straight down
            dirX = 0;
            dirY = 1.5; // Faster!
        } else if (enemy.type === "teleporter") {
            // Teleporter - straight down with occasional teleport
            enemy.teleportTimer++;
            if (enemy.teleportTimer > 180) {
                // Teleport to random X position at top
                enemy.x = Math.random() * canvas.width;
                enemy.y = -20;
                enemy.teleportTimer = 0;
                spawnHitParticles(enemy.x, enemy.y, "#ff00ff", 15);
            }
            dirX = 0;
            dirY = 1;
        }
        
        // Move enemy
        enemy.x += dirX * enemy.speed;
        enemy.y += dirY * enemy.speed;
        
        // Remove enemies that go off screen (bottom)
        if (enemy.y > canvas.height + 50) {
            const index = enemies.indexOf(enemy);
            if (index > -1) {
                enemies.splice(index, 1);
            }
        }
    }
}

// ========================================
// POWER-UP SYSTEM
// ========================================

function spawnPowerUp() {
    const types = ['shield', 'speed', 'rapidFire', 'health'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    powerUps.push({
        x: Math.random() * (canvas.width - 60) + 30,
        y: Math.random() * (canvas.height - 60) + 30,
        size: 15,
        type,
        life: 600,
        pulse: 0
    });
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        
        // Physics for dropped power-ups
        if (p.vx !== undefined) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.vx *= 0.95;
            p.rotation = (p.rotation || 0) + 0.1;
            
            // Bounce off ground
            if (p.y > canvas.height - 30) {
                p.y = canvas.height - 30;
                p.vy *= -0.4;
            }
        }
        
        p.life--;
        p.pulse += 0.15;
        
        // Blink when about to expire
        if (p.life < 100 && p.life % 10 < 5) {
            continue; // Skip rendering to create blink effect
        }
        
        if (p.life <= 0) {
            powerUps.splice(i, 1);
            continue;
        }
        
        // Magnetic attraction to player when close
        const dx = player.x - p.x;
        const dy = player.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80) {
            const attractSpeed = 3;
            p.x += (dx / dist) * attractSpeed;
            p.y += (dy / dist) * attractSpeed;
        }
        
        // Check collision with player
        if (dist < player.size + p.size + 5) {
            activatePowerUp(p.type);
            powerUps.splice(i, 1);
            
            // Track power-up collection for challenges
            if (currentUser) {
                if (!currentUser.powerUpsCollected) currentUser.powerUpsCollected = 0;
                currentUser.powerUpsCollected++;
                updateChallengeProgress('powerups', currentUser.powerUpsCollected);
            }
            
            // Visual feedback
            spawnHitParticles(p.x, p.y, "#00ff00", 20);
            createExplosion(p.x, p.y, p.size);
        }
    }
}

function activatePowerUp(type) {
    powerUpSound();
    
    const duration = 600 + (shopUpgrades.shieldDuration * 100); // Shop upgrades extend duration
    
    if (type === 'shield') {
        player.shield = true;
        player.shieldTimer = duration;
        showFloatingText(player.x, player.y - 30, "🛡️ SHIELD!", "#00ffff", 50);
        screenShake = 5;
    } else if (type === 'speed') {
        player.speedBoost = true;
        player.speedBoostTimer = duration;
        showFloatingText(player.x, player.y - 30, "⚡ SPEED BOOST!", "#ffff00", 50);
        screenShake = 5;
    } else if (type === 'rapidFire') {
        player.rapidFire = true;
        player.rapidFireTimer = duration;
        showFloatingText(player.x, player.y - 30, "🔥 RAPID FIRE!", "#ff6600", 50);
        screenShake = 5;
    } else if (type === 'health') {
        if (player.health < player.maxHealth) {
            const healAmount = 2;
            player.health = Math.min(player.maxHealth, player.health + healAmount);
            showFloatingText(player.x, player.y - 30, `❤️ +${healAmount} HEALTH!`, "#ff0066", 50);
            screenShake = 5;
        } else {
            showFloatingText(player.x, player.y - 30, "❤️ FULL HEALTH!", "#00ff00", 40);
        }
    } else if (type === 'damage') {
        // Temporary damage boost
        player.tempDamageBoost = true;
        player.tempDamageTimer = 300;
        showFloatingText(player.x, player.y - 30, "⚔️ DAMAGE x2!", "#ff0000", 50);
        screenShake = 8;
    } else if (type === 'multiShot') {
        // Temporary multi-shot
        player.tempMultiShot = true;
        player.tempMultiShotTimer = 300;
        showFloatingText(player.x, player.y - 30, "🎯 MULTI-SHOT!", "#ff00ff", 50);
        screenShake = 8;
    }
}

// ========================================
// COLLISION SYSTEM
// ========================================

function checkPlayerCollision() {
    if (player.invincible) return;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.size + enemy.size - 3) { // Smaller hitbox - more forgiving
            if (player.shield) {
                player.shield = false;
                player.shieldTimer = 0;
                player.invincible = true;
                player.invincibleTimer = 120; // Increased from 60 - longer invincibility
                enemies.splice(i, 1);
                spawnHitParticles(enemy.x, enemy.y, "#00ffff", 20);
            } else {
                player.health--;
                player.invincible = true;
                player.invincibleTimer = 120; // Increased from 60 - longer invincibility
                player.killStreak = 0; // Reset streak on hit
                spawnHitParticles(player.x, player.y, "#ff5252", 30);
                screenShake = 15;
                
                // Track max no-damage time for challenge
                if (noDamageTime > maxNoDamageTime) {
                    maxNoDamageTime = noDamageTime;
                }
                noDamageTime = 0; // Reset no-damage timer
                
                if (player.health <= 0) {
                    gameOver();
                }
            }
            break;
        }
    }
}

function checkBulletCollisions() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            const dx = enemy.x - b.x;
            const dy = enemy.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < enemy.size + b.size) {
                if (!b.piercing) {
                    bullets.splice(j, 1);
                }
                enemy.hp -= b.damage || 1;
                hitSound();
                
                // Track hit for stats
                if (currentUser) {
                    if (!currentUser.totalHits) currentUser.totalHits = 0;
                    currentUser.totalHits++;
                }
                
                const hitColor = b.isCrit ? "#ff0000" : "#80d8ff";
                spawnHitParticles(b.x, b.y, hitColor, b.isCrit ? 15 : 8);
                showFloatingText(enemy.x, enemy.y - 20, `-${Math.floor(b.damage || 1)}`, b.isCrit ? "#ff0000" : "#ffff00", 20);
                
                if (enemy.hp <= 0) {
                    let baseScore = 10;
                    if (enemy.type === "zigzag") baseScore = 15;
                    else if (enemy.type === "orbiter") baseScore = 25;
                    else if (enemy.type === "sprinter") baseScore = 20;
                    else if (enemy.type === "boss") baseScore = 500;
                    
                    score += baseScore * combo;
                    combo++;
                    comboTimer = 180;
                    
                    // Combo visual effects
                    if (combo === 5) {
                        triggerScreenFlash('#ffff00', 10);
                        spawnStarBurst(enemy.x, enemy.y, '#ffff00', 12);
                    } else if (combo === 10) {
                        triggerScreenFlash('#ff6600', 15);
                        spawnStarBurst(enemy.x, enemy.y, '#ff6600', 16);
                    } else if (combo >= 20) {
                        triggerScreenFlash('#ff0000', 20);
                        spawnStarBurst(enemy.x, enemy.y, '#ff0000', 20);
                    }
                    enemiesKilled++;
                    levelProgress++; // LEVEL PROGRESS!
                    player.killStreak++;
                    if (player.killStreak > player.maxKillStreak) {
                        player.maxKillStreak = player.killStreak;
                    }
                    
                    // Ultimate charge
                    player.ultimateCharge = Math.min(100, player.ultimateCharge + 15); // BAHUT FAST ultimate charge!
                    
                    showFloatingText(enemy.x, enemy.y, `+${baseScore * combo}`, "#00ff00", 30);
                    spawnHitParticles(enemy.x, enemy.y, "#ff00ff", 25);
                    createExplosion(enemy.x, enemy.y, enemy.size);
                    
                    // Drop items (coins/gems)
                    spawnDrop(enemy.x, enemy.y, enemy.isBoss);
                    
                    // Drop power-ups (random chance)
                    spawnPowerUpDrop(enemy.x, enemy.y, enemy.isBoss);
                    
                    // Slow motion on perfect kill
                    if (combo >= 5 && Math.random() < 0.3) {
                        activateSlowMotion();
                    }
                    
                    // Kill streak rewards
                    if (player.killStreak % 10 === 0) {
                        showFloatingText(player.x, player.y - 40, `🔥 ${player.killStreak} STREAK!`, "#ff0000", 60);
                        player.coins += 10;
                    }
                    
                    if (enemy.isBoss) {
                        bossActive = false;
                        unlockAchievement('bossSlayer');
                        screenShake = 20;
                        player.coins += 50;
                        player.gems += 5;
                    }
                    
                    enemies.splice(i, 1);
                    checkAchievements();
                }
                break;
            }
        }
    }
}

// ========================================
// PARTICLES & EFFECTS
// ========================================

// ========================================
// BACKGROUND EFFECTS
// ========================================

function updateBackgroundStars() {
    for (let star of backgroundStars) {
        star.y += star.speed;
        star.brightness = 0.3 + Math.sin(gameTime * 0.05 + star.x) * 0.3;
        
        // Wrap around
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }
}

function drawBackgroundStars() {
    ctx.save();
    for (let star of backgroundStars) {
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

// Screen flash effect for special events
function triggerScreenFlash(color = '#ffffff', intensity = 20) {
    screenFlash = intensity;
    screenFlashColor = color;
}

function drawScreenFlash() {
    if (screenFlash > 0) {
        ctx.save();
        ctx.globalAlpha = screenFlash / 20;
        ctx.fillStyle = screenFlashColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        screenFlash--;
    }
}

// ========================================
// ENHANCED PARTICLE SYSTEM
// ========================================

function spawnHitParticles(px, py, color = "#ffeb3b", count = 12) {
    // Enhanced particles with variety!
    const particleCount = Math.min(8, count); // More particles for better effect
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const speed = Math.random() * 4 + 2;
        
        hitParticles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 25 + Math.random() * 10,
            maxLife: 35,
            color,
            size: Math.random() * 3 + 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            type: Math.random() > 0.5 ? 'circle' : 'square'
        });
    }
}

// Spawn star burst particles for special events
function spawnStarBurst(px, py, color = "#ffff00", count = 16) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        const speed = Math.random() * 6 + 3;
        
        hitParticles.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 40,
            maxLife: 40,
            color,
            size: Math.random() * 4 + 2,
            rotation: 0,
            rotationSpeed: 0.2,
            type: 'star'
        });
    }
}

// Spawn trail particles for movement
function spawnTrailParticle(px, py, color = "#00ffff") {
    if (Math.random() > 0.7) { // 30% chance
        hitParticles.push({
            x: px + (Math.random() - 0.5) * 10,
            y: py + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            life: 15,
            maxLife: 15,
            color,
            size: Math.random() * 2 + 1,
            rotation: 0,
            rotationSpeed: 0,
            type: 'circle'
        });
    }
}

function updateParticles() {
    for (let i = hitParticles.length - 1; i >= 0; i--) {
        const p = hitParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96; // Slightly more friction
        p.vy *= 0.96;
        p.vy += 0.1; // Gravity effect
        p.rotation += p.rotationSpeed;
        p.life--;
        
        if (p.life <= 0) {
            hitParticles.splice(i, 1);
        }
    }
}

function showFloatingText(x, y, text, color, life) {
    floatingTexts.push({ x, y, text, color, life, maxLife: life, vy: -1 });
}

function updateFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const t = floatingTexts[i];
        t.y += t.vy;
        t.life--;
        
        if (t.life <= 0) {
            floatingTexts.splice(i, 1);
        }
    }
}

// ========================================
// NEW ABILITIES & SYSTEMS
// ========================================

function activateDash() {
    player.dashDuration = 20; // Longer dash!
    player.dashCooldown = 60; // 1 second - SUPER FAST!
    playSound(1200, 0.1, 'square');
    showFloatingText(player.x, player.y - 30, "💨 DASH!", "#00ffff", 30);
}

function activateUltimate() {
    player.ultimateCharge = 0;
    player.ultimateCooldown = 180; // 3 seconds - BAHUT FAST!
    playSound(1500, 0.5, 'sawtooth');
    
    // Screen clear - SAB ENEMIES MAAR DO!
    for (let enemy of enemies) {
        if (!enemy.isBoss) {
            createExplosion(enemy.x, enemy.y, enemy.size * 2);
            spawnDrop(enemy.x, enemy.y, false);
            score += 10; // Bonus score!
        } else {
            enemy.hp -= 30; // Boss ko bhi bahut damage!
        }
    }
    
    enemies = enemies.filter(e => e.isBoss && e.hp > 0);
    screenShake = 30;
    showFloatingText(canvas.width / 2, canvas.height / 2, "⚡ ULTIMATE! ⚡", "#ffff00", 60);
}

function activateSlowMotion() {
    slowMotion = true;
    slowMotionTimer = 120; // 2 seconds
}

function upgradeWeapon() {
    const cost = player.weaponLevel * 10;
    if (player.coins >= cost && player.weaponLevel < 10) {
        player.coins -= cost;
        player.weaponLevel++;
        playSound(1200, 0.3, 'triangle');
        showFloatingText(player.x, player.y - 40, `⬆️ WEAPON LV ${player.weaponLevel}!`, "#00ff00", 50);
    } else if (player.weaponLevel >= 10) {
        showFloatingText(player.x, player.y - 40, "MAX LEVEL!", "#ffaa00", 30);
    } else {
        showFloatingText(player.x, player.y - 40, `Need ${cost}💰`, "#ff0000", 30);
    }
}

function spawnDrop(x, y, isBoss) {
    const rand = Math.random();
    let type = 'coin';
    
    if (isBoss) {
        type = 'gem';
    } else if (rand > 0.9) {
        type = 'gem';
    } else if (rand > 0.7) {
        type = 'coin';
    } else {
        return; // No drop
    }
    
    drops.push({
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 2,
        type,
        life: 300,
        pulse: 0
    });
}

// ========================================
// POWER-UP DROP SYSTEM
// ========================================

function spawnPowerUpDrop(x, y, isBoss) {
    const rand = Math.random();
    const luckBonus = shopUpgrades.luck * 0.05; // Luck increases drop rate
    
    let dropChance = 0.15 + luckBonus; // 15% base chance + luck bonus
    if (isBoss) dropChance = 1.0; // Boss always drops power-up
    
    if (rand > dropChance) return; // No drop
    
    // Determine power-up type
    const powerUpTypes = ['health', 'shield', 'speed', 'rapidFire', 'damage', 'multiShot'];
    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    powerUps.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2 - 3,
        size: 12,
        type,
        life: 400,
        pulse: 0,
        rotation: 0
    });
}

function updateDrops() {
    for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.15; // Gravity
        d.vx *= 0.98;
        d.life--;
        d.pulse += 0.15;
        
        // Bounce off ground
        if (d.y > canvas.height - 20) {
            d.y = canvas.height - 20;
            d.vy *= -0.5;
        }
        
        if (d.life <= 0) {
            drops.splice(i, 1);
            continue;
        }
        
        // Collect
        const dx = player.x - d.x;
        const dy = player.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < player.size + 10) {
            if (d.type === 'coin') {
                player.coins++;
                showFloatingText(d.x, d.y, "+1💰", "#ffd700", 20);
            } else if (d.type === 'gem') {
                player.gems++;
                showFloatingText(d.x, d.y, "+1💎", "#00ffff", 20);
            }
            powerUpSound();
            drops.splice(i, 1);
        }
    }
}

function createExplosion(x, y, size) {
    explosions.push({
        x, y,
        size: size,
        maxSize: size * 4,
        life: 20,
        maxLife: 20
    });
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.life--;
        e.size += (e.maxSize - e.size) * 0.2;
        
        if (e.life <= 0) {
            explosions.splice(i, 1);
        }
    }
}

// ========================================
// LEVEL SYSTEM - Progressive Difficulty
// ========================================

function checkLevelProgress() {
    // Check if enough enemies killed for next level
    if (levelProgress >= enemiesRequiredForLevel && !levelTransitioning) {
        levelUp();
    }
}

function levelUp() {
    // Mark previous level as completed
    const previousLevel = currentLevel;
    if (!completedLevels.includes(previousLevel)) {
        completedLevels.push(previousLevel);
    }
    
    currentLevel++;
    levelProgress = 0;
    levelTransitioning = true;
    levelTransitionTimer = 180; // 3 seconds celebration
    
    // Update max unlocked level
    if (currentLevel > maxUnlockedLevel) {
        maxUnlockedLevel = currentLevel;
    }
    
    // Save level progression to user data
    if (currentUser) {
        currentUser.currentLevel = currentLevel;
        currentUser.maxUnlockedLevel = maxUnlockedLevel;
        currentUser.completedLevels = completedLevels;
        if (!currentUser.levelScores) currentUser.levelScores = {};
        currentUser.levelScores[previousLevel] = score;
        saveUserData();
    }
    
    // Level up rewards - PROGRESSIVE REWARDS!
    const healthReward = Math.min(3, 1 + Math.floor(currentLevel / 3)); // More health at higher levels
    player.health = Math.min(player.maxHealth, player.health + healthReward);
    
    const coinReward = currentLevel * 15 + Math.floor(Math.pow(currentLevel, 1.5) * 5); // Exponential coin rewards
    const gemReward = Math.floor(currentLevel * 1.5 + Math.pow(currentLevel, 1.2)); // Exponential gem rewards
    
    player.coins += coinReward;
    player.gems += gemReward;
    player.ultimateCharge = 100; // Full ultimate charge!
    
    // Increase difficulty for next level - PROGRESSIVE!
    enemiesRequiredForLevel = Math.floor(10 + (currentLevel * 7) + Math.pow(currentLevel, 1.3)); // Exponential enemy requirement
    
    // Visual effects
    screenShake = 25;
    activateSlowMotion();
    playSound(1500, 0.5, 'triangle');
    triggerScreenFlash('#ffff00', 25);
    spawnStarBurst(canvas.width / 2, canvas.height / 2, '#ffff00', 30);
    
    // Show level up message with dynamic rewards
    showFloatingText(canvas.width / 2, canvas.height / 2 - 50, `🎉 LEVEL ${currentLevel} UNLOCKED! 🎉`, "#ffff00", 120);
    showFloatingText(canvas.width / 2, canvas.height / 2, `+${healthReward} ❤️ | +${coinReward}💰 | +${gemReward}💎`, "#00ff00", 100);
    showFloatingText(canvas.width / 2, canvas.height / 2 + 40, `⚡ ULTIMATE READY!`, "#00ffff", 100);
    showFloatingText(canvas.width / 2, canvas.height / 2 + 70, `💾 Progress Saved! Next: ${enemiesRequiredForLevel} enemies`, "#00ff00", 80);
    
    // Achievement notification
    achievementText.textContent = `🎊 LEVEL ${currentLevel} UNLOCKED! 🎊`;
    achievementBox.classList.remove('hidden');
    setTimeout(() => {
        achievementBox.classList.add('hidden');
    }, 3000);
}

function getLevelDifficultyMultiplier() {
    // AI-based difficulty scaling - PROGRESSIVE INCREASE!
    // Each level increases enemy stats progressively
    const baseMultiplier = 1.0;
    const levelScaling = (currentLevel - 1) * 0.25; // +25% per level (increased from 15%)
    const exponentialBonus = Math.pow(1.05, currentLevel - 1); // Exponential growth!
    return (baseMultiplier + levelScaling) * exponentialBonus;
}

function getLevelSpeedBonus() {
    // Enemy speed increases with level - PROGRESSIVE!
    const baseBonus = (currentLevel - 1) * 0.15; // Reduced from 0.2 to keep game playable
    const exponentialBonus = Math.pow(1.03, currentLevel - 1); // Slow exponential growth
    return baseBonus * exponentialBonus;
}

function getLevelHPBonus() {
    // Enemy HP increases with level - MUCH MORE PROGRESSIVE!
    const baseBonus = Math.floor((currentLevel - 1) * 1.5); // Increased from 0.5 to 1.5
    const exponentialBonus = Math.pow(1.1, currentLevel - 1); // Strong exponential growth!
    return Math.floor(baseBonus * exponentialBonus);
}

// ========================================
// ACHIEVEMENTS SYSTEM
// ========================================

function checkAchievements() {
    if (!achievements.firstBlood && enemiesKilled >= 1) {
        unlockAchievement('firstBlood');
    }
    if (!achievements.survivor && gameTime >= 3600) {
        unlockAchievement('survivor');
    }
    if (!achievements.comboMaster && combo >= 10) {
        unlockAchievement('comboMaster');
    }
    if (!achievements.sharpShooter && enemiesKilled >= 100) {
        unlockAchievement('sharpShooter');
    }
}

function unlockAchievement(name) {
    if (achievements[name]) return;
    
    achievements[name] = true;
    achievementSound();
    
    const messages = {
        firstBlood: '🎯 First Blood!',
        survivor: '⏱️ Survivor - 60s!',
        comboMaster: '🔥 Combo Master x10!',
        bossSlayer: '👑 Boss Slayer!',
        sharpShooter: '🎖️ Sharp Shooter - 100 Kills!'
    };
    
    achievementText.textContent = messages[name];
    achievementBox.classList.remove('hidden');
    
    setTimeout(() => {
        achievementBox.classList.add('hidden');
    }, 3000);
}

// ========================================
// GAME OVER & HIGH SCORE
// ========================================

function gameOver() {
    isGameOver = true;
    isRunning = false;
    isPaused = false;
    pauseBanner.classList.add("hidden");
    weaponHUD.classList.add("hidden");
    stopBackgroundMusic();
    
    const seconds = Math.floor(gameTime / 60);
    finalTime.textContent = `⏱️ Survival Time: ${seconds}s | Wave ${wave}`;
    finalScore.textContent = `🎯 Score: ${score} | 💀 Kills: ${enemiesKilled} | 🔥 Max Streak: ${player.maxKillStreak}`;
    
    // Update challenge progress
    updateChallengeProgress('kills', enemiesKilled);
    updateChallengeProgress('score', score);
    updateChallengeProgress('survive', seconds);
    updateChallengeProgress('combo', player.maxKillStreak);
    updateChallengeProgress('wave', wave);
    
    // Track max no-damage time
    if (noDamageTime > maxNoDamageTime) {
        maxNoDamageTime = noDamageTime;
    }
    const maxNoDamageSeconds = Math.floor(maxNoDamageTime / 60);
    updateChallengeProgress('noDamage', maxNoDamageSeconds);
    
    // Calculate accuracy for challenge
    if (currentUser && currentUser.totalShots > 0) {
        const accuracy = (currentUser.totalHits / currentUser.totalShots) * 100;
        updateChallengeProgress('accuracy', Math.floor(accuracy));
    }
    
    // Update leaderboard
    addToLeaderboard(score, seconds, enemiesKilled, difficulty);
    displayLeaderboard();
    
    // Save user data
    if (currentUser) {
        currentUser.totalGamesPlayed++;
        currentUser.totalKills += enemiesKilled;
        currentUser.totalPlayTime += seconds;
        currentUser.totalDeaths++;
        currentUser.totalCoinsEarned = (currentUser.totalCoinsEarned || 0) + player.coins;
        if (player.maxKillStreak > (currentUser.maxKillStreak || 0)) {
            currentUser.maxKillStreak = player.maxKillStreak;
        }
        currentUser.leaderboard = leaderboard;
        currentUser.achievements = achievements;
        currentUser.perks = perks;
        
        if (score > currentUser.highScore) {
            currentUser.highScore = score;
            highScore = score;
            highScoreDisplay.textContent = `🏆 NEW HIGH SCORE: ${highScore} | 💰 ${player.coins} Coins | 💎 ${player.gems} Gems`;
            highScoreDisplay.style.color = '#00ff00';
        } else {
            highScore = currentUser.highScore;
            highScoreDisplay.textContent = `🏆 High Score: ${highScore} | 💰 ${player.coins} Coins | 💎 ${player.gems} Gems`;
            highScoreDisplay.style.color = '#ffaa00';
        }
        
        saveUserData();
        
        // Show save confirmation
        showFloatingText(canvas.width / 2, canvas.height / 2 + 100, "💾 Progress Saved!", "#00ff00", 120);
    } else {
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = `🏆 NEW HIGH SCORE: ${highScore} | 💰 ${player.coins} Coins | 💎 ${player.gems} Gems`;
            highScoreDisplay.style.color = '#00ff00';
        } else {
            highScoreDisplay.textContent = `🏆 High Score: ${highScore} | 💰 ${player.coins} Coins | 💎 ${player.gems} Gems`;
            highScoreDisplay.style.color = '#ffaa00';
        }
    }
    
    gameOverScreen.classList.remove("hidden");
}

function addToLeaderboard(score, time, kills, diff) {
    const entry = {
        score,
        time,
        kills,
        difficulty: diff,
        date: new Date().toLocaleDateString()
    };
    
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep top 10
    
    localStorage.setItem('neonSurvivalLeaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p style="text-align:center;color:#888;">No entries yet</p>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `leaderboard-entry ${index < 3 ? 'top3' : ''}`;
        
        const rank = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index + 1}.`));
        const diffIcon = entry.difficulty === 'easy' ? '😊' : (entry.difficulty === 'hard' ? '😈' : '😐');
        
        div.innerHTML = `
            <span>${rank} ${entry.score} pts ${diffIcon}</span>
            <span>${entry.time}s | ${entry.kills} kills</span>
        `;
        
        leaderboardList.appendChild(div);
    });
}

// ========================================
// DRAWING FUNCTIONS
// ========================================

function drawPlayer() {
    ctx.save();
    
    // Shield effect
    if (player.shield) {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size + 15, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(gameTime * 0.2) * 0.4})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Outer shield glow
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size + 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(gameTime * 0.2) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // Invincibility flicker
    if (player.invincible && Math.floor(gameTime / 5) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // ADVANCED BLUE SPACESHIP - Player!
    const shipWidth = player.size * 2.5;
    const shipHeight = player.size * 2.8;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(Math.PI); // Ship upar ki taraf point karega
    
    // === MAIN BODY ===
    
    // Main body gradient (white to blue)
    const bodyGradient = ctx.createLinearGradient(0, -shipHeight/2, 0, shipHeight/2);
    bodyGradient.addColorStop(0, '#ffffff');
    bodyGradient.addColorStop(0.3, '#e0e0e0');
    bodyGradient.addColorStop(0.7, '#b0b0b0');
    bodyGradient.addColorStop(1, '#808080');
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(0, -shipHeight / 2); // Nose
    ctx.lineTo(shipWidth / 6, -shipHeight / 4);
    ctx.lineTo(shipWidth / 6, shipHeight / 3);
    ctx.lineTo(0, shipHeight / 2.5);
    ctx.lineTo(-shipWidth / 6, shipHeight / 3);
    ctx.lineTo(-shipWidth / 6, -shipHeight / 4);
    ctx.closePath();
    ctx.fill();
    
    // Body outline
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // === WINGS ===
    
    // Left wing (blue gradient)
    const leftWingGradient = ctx.createLinearGradient(-shipWidth/2, 0, -shipWidth/6, 0);
    leftWingGradient.addColorStop(0, '#0066ff');
    leftWingGradient.addColorStop(0.5, '#0088ff');
    leftWingGradient.addColorStop(1, '#00aaff');
    
    ctx.fillStyle = leftWingGradient;
    ctx.beginPath();
    ctx.moveTo(-shipWidth / 6, -shipHeight / 8);
    ctx.lineTo(-shipWidth / 2, shipHeight / 6);
    ctx.lineTo(-shipWidth / 2.5, shipHeight / 3);
    ctx.lineTo(-shipWidth / 6, shipHeight / 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0044aa';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Right wing (blue gradient)
    const rightWingGradient = ctx.createLinearGradient(shipWidth/6, 0, shipWidth/2, 0);
    rightWingGradient.addColorStop(0, '#00aaff');
    rightWingGradient.addColorStop(0.5, '#0088ff');
    rightWingGradient.addColorStop(1, '#0066ff');
    
    ctx.fillStyle = rightWingGradient;
    ctx.beginPath();
    ctx.moveTo(shipWidth / 6, -shipHeight / 8);
    ctx.lineTo(shipWidth / 2, shipHeight / 6);
    ctx.lineTo(shipWidth / 2.5, shipHeight / 3);
    ctx.lineTo(shipWidth / 6, shipHeight / 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0044aa';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // === COCKPIT (Center glowing window) ===
    
    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, -shipHeight/8, 0, 0, -shipHeight/8, shipWidth/3);
    glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    glowGradient.addColorStop(0.5, 'rgba(0, 200, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(0, 150, 255, 0)');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, -shipHeight / 8, shipWidth / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Diamond cockpit shape
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(0, -shipHeight / 5);
    ctx.lineTo(shipWidth / 8, -shipHeight / 8);
    ctx.lineTo(0, 0);
    ctx.lineTo(-shipWidth / 8, -shipHeight / 8);
    ctx.closePath();
    ctx.fill();
    
    // Inner glow
    const innerGlow = ctx.createRadialGradient(0, -shipHeight/8, 0, 0, -shipHeight/8, shipWidth/8);
    innerGlow.addColorStop(0, '#ffffff');
    innerGlow.addColorStop(0.5, '#00ffff');
    innerGlow.addColorStop(1, '#0088ff');
    
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(0, -shipHeight / 8, shipWidth / 10, 0, Math.PI * 2);
    ctx.fill();
    
    // === SIDE ENGINES (Blue circles) ===
    
    // Left engine
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(-shipWidth / 4, shipHeight / 8, shipWidth / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Left engine glow
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(-shipWidth / 4, shipHeight / 8, shipWidth / 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Right engine
    ctx.fillStyle = '#0066ff';
    ctx.beginPath();
    ctx.arc(shipWidth / 4, shipHeight / 8, shipWidth / 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Right engine glow
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(shipWidth / 4, shipHeight / 8, shipWidth / 16, 0, Math.PI * 2);
    ctx.fill();
    
    // === ENGINE FLAMES (Animated) ===
    
    const flamePhase = gameTime % 8;
    const flameIntensity = Math.sin(gameTime * 0.3) * 0.3 + 0.7;
    
    // Main center flame
    if (flamePhase < 4) {
        // Outer flame (orange)
        ctx.fillStyle = `rgba(255, 100, 0, ${flameIntensity})`;
        ctx.beginPath();
        ctx.moveTo(-shipWidth / 8, shipHeight / 2.5);
        ctx.lineTo(0, shipHeight / 2.5 + shipHeight / 2.5 * flameIntensity);
        ctx.lineTo(shipWidth / 8, shipHeight / 2.5);
        ctx.closePath();
        ctx.fill();
        
        // Inner flame (yellow)
        ctx.fillStyle = `rgba(255, 255, 0, ${flameIntensity})`;
        ctx.beginPath();
        ctx.moveTo(-shipWidth / 12, shipHeight / 2.5);
        ctx.lineTo(0, shipHeight / 2.5 + shipHeight / 3.5 * flameIntensity);
        ctx.lineTo(shipWidth / 12, shipHeight / 2.5);
        ctx.closePath();
        ctx.fill();
        
        // Core flame (white)
        ctx.fillStyle = `rgba(255, 255, 255, ${flameIntensity * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(-shipWidth / 20, shipHeight / 2.5);
        ctx.lineTo(0, shipHeight / 2.5 + shipHeight / 5 * flameIntensity);
        ctx.lineTo(shipWidth / 20, shipHeight / 2.5);
        ctx.closePath();
        ctx.fill();
    }
    
    // Side engine flames (blue)
    const sideFlameIntensity = Math.sin(gameTime * 0.4) * 0.2 + 0.6;
    
    // Left engine flame
    ctx.fillStyle = `rgba(0, 150, 255, ${sideFlameIntensity})`;
    ctx.beginPath();
    ctx.moveTo(-shipWidth / 4 - shipWidth / 15, shipHeight / 8 + shipWidth / 12);
    ctx.lineTo(-shipWidth / 4, shipHeight / 8 + shipWidth / 6 * sideFlameIntensity);
    ctx.lineTo(-shipWidth / 4 + shipWidth / 15, shipHeight / 8 + shipWidth / 12);
    ctx.closePath();
    ctx.fill();
    
    // Right engine flame
    ctx.fillStyle = `rgba(0, 150, 255, ${sideFlameIntensity})`;
    ctx.beginPath();
    ctx.moveTo(shipWidth / 4 - shipWidth / 15, shipHeight / 8 + shipWidth / 12);
    ctx.lineTo(shipWidth / 4, shipHeight / 8 + shipWidth / 6 * sideFlameIntensity);
    ctx.lineTo(shipWidth / 4 + shipWidth / 15, shipHeight / 8 + shipWidth / 12);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // No aim line needed - auto-aim hai!
    
    ctx.restore();
}

function drawEnemies() {
    for (let enemy of enemies) {
        ctx.save();
        
        // ENEMY SPACESHIP - Similar to player but RED/PURPLE theme
        const shipWidth = enemy.size * 1.8;
        const shipHeight = enemy.size * 2.2;
        
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(0); // Ship neeche ki taraf point karega
        
        // Different colors for different enemy types
        let bodyColor1 = "#ff3333";
        let bodyColor2 = "#cc0000";
        let wingColor = "#ff0066";
        let glowColor = "#ff0000";
        
        if (enemy.type === "chaser") {
            bodyColor1 = "#ff0000";
            bodyColor2 = "#990000";
            wingColor = "#cc0000";
            glowColor = "#ff3333";
        } else if (enemy.type === "zigzag") {
            bodyColor1 = "#ff6666";
            bodyColor2 = "#ff3333";
            wingColor = "#ff9999";
            glowColor = "#ff6666";
        } else if (enemy.type === "orbiter") {
            bodyColor1 = "#cc00cc";
            bodyColor2 = "#990099";
            wingColor = "#ff00ff";
            glowColor = "#cc00cc";
        } else if (enemy.type === "sprinter") {
            bodyColor1 = "#ff4444";
            bodyColor2 = "#ff0000";
            wingColor = "#ff6666";
            glowColor = "#ff4444";
        } else if (enemy.type === "boss") {
            bodyColor1 = "#990000";
            bodyColor2 = "#660000";
            wingColor = "#cc0000";
            glowColor = "#ff0000";
        } else if (enemy.type === "tank") {
            bodyColor1 = "#aa0000";
            bodyColor2 = "#770000";
            wingColor = "#dd0000";
            glowColor = "#aa0000";
        }
        
        // === MAIN BODY ===
        const bodyGradient = ctx.createLinearGradient(0, -shipHeight/2, 0, shipHeight/2);
        bodyGradient.addColorStop(0, bodyColor1);
        bodyGradient.addColorStop(0.5, bodyColor2);
        bodyGradient.addColorStop(1, '#333333');
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(0, -shipHeight / 2);
        ctx.lineTo(shipWidth / 8, -shipHeight / 4);
        ctx.lineTo(shipWidth / 8, shipHeight / 3);
        ctx.lineTo(0, shipHeight / 2.5);
        ctx.lineTo(-shipWidth / 8, shipHeight / 3);
        ctx.lineTo(-shipWidth / 8, -shipHeight / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // === WINGS ===
        ctx.fillStyle = wingColor;
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(-shipWidth / 8, -shipHeight / 10);
        ctx.lineTo(-shipWidth / 2.5, shipHeight / 8);
        ctx.lineTo(-shipWidth / 3, shipHeight / 3);
        ctx.lineTo(-shipWidth / 8, shipHeight / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(shipWidth / 8, -shipHeight / 10);
        ctx.lineTo(shipWidth / 2.5, shipHeight / 8);
        ctx.lineTo(shipWidth / 3, shipHeight / 3);
        ctx.lineTo(shipWidth / 8, shipHeight / 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        
        // === COCKPIT (Evil red glow) ===
        const glowGradient = ctx.createRadialGradient(0, -shipHeight/8, 0, 0, -shipHeight/8, shipWidth/4);
        glowGradient.addColorStop(0, `rgba(255, 0, 0, 0.8)`);
        glowGradient.addColorStop(0.5, `rgba(255, 0, 0, 0.3)`);
        glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, -shipHeight / 8, shipWidth / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Evil eye
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, -shipHeight / 8, shipWidth / 12, 0, Math.PI * 2);
        ctx.fill();
        
        // === ENGINE FLAMES ===
        const flamePhase = (gameTime + enemy.x) % 6;
        const flameIntensity = Math.sin((gameTime + enemy.x) * 0.3) * 0.2 + 0.7;
        
        if (flamePhase < 3) {
            // Orange flame
            ctx.fillStyle = `rgba(255, 100, 0, ${flameIntensity})`;
            ctx.beginPath();
            ctx.moveTo(-shipWidth / 10, shipHeight / 2.5);
            ctx.lineTo(0, shipHeight / 2.5 + shipHeight / 3 * flameIntensity);
            ctx.lineTo(shipWidth / 10, shipHeight / 2.5);
            ctx.closePath();
            ctx.fill();
            
            // Yellow core
            ctx.fillStyle = `rgba(255, 200, 0, ${flameIntensity})`;
            ctx.beginPath();
            ctx.moveTo(-shipWidth / 15, shipHeight / 2.5);
            ctx.lineTo(0, shipHeight / 2.5 + shipHeight / 4 * flameIntensity);
            ctx.lineTo(shipWidth / 15, shipHeight / 2.5);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
        
        // Boss health bar
        if (enemy.isBoss) {
            const barWidth = 70;
            const barHeight = 8;
            const healthPercent = enemy.hp / enemy.maxHp;
            
            // Background
            ctx.fillStyle = "#000000";
            ctx.fillRect(enemy.x - barWidth/2 - 1, enemy.y - enemy.size - 40, barWidth + 2, barHeight + 2);
            
            // Red bar background
            ctx.fillStyle = "#333333";
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 39, barWidth, barHeight);
            
            // Health bar
            const healthGradient = ctx.createLinearGradient(enemy.x - barWidth/2, 0, enemy.x + barWidth/2, 0);
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(0.5, '#ff3333');
            healthGradient.addColorStop(1, '#ff6666');
            
            ctx.fillStyle = healthGradient;
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.size - 39, barWidth * healthPercent, barHeight);
            
            // Boss label
            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 10px Arial";
            ctx.textAlign = "center";
            ctx.fillText("BOSS", enemy.x, enemy.y - enemy.size - 45);
        }
        
        ctx.restore();
    }
}

function drawBullets() {
    ctx.save();
    
    for (let b of bullets) {
        // Get bullet color (default green for normal)
        const bulletColor = b.color || '#76ff03';
        
        // Parse RGB from hex color
        let r = 118, g = 255, bl = 3;
        if (bulletColor.startsWith('#')) {
            const hex = bulletColor.slice(1);
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            bl = parseInt(hex.slice(4, 6), 16);
        }
        
        // Initialize trail if not exists
        if (!b.trail) b.trail = [];
        
        // Add current position to trail
        b.trail.push({ x: b.x, y: b.y, life: 8 });
        
        // Different trail lengths for different weapons
        const maxTrailLength = b.piercing ? 10 : (b.color === '#ff00ff' ? 8 : 6);
        if (b.trail.length > maxTrailLength) b.trail.shift();
        
        // Draw trail (fading effect) - Different for each weapon
        for (let i = 0; i < b.trail.length; i++) {
            const t = b.trail[i];
            const alpha = (i / b.trail.length) * 0.6;
            const trailSize = b.size * (0.4 + (i / b.trail.length) * 0.6);
            
            // Trail glow with bullet color
            const trailGradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, trailSize * 2);
            trailGradient.addColorStop(0, `rgba(${r}, ${g}, ${bl}, ${alpha * 0.8})`);
            trailGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${bl}, ${alpha * 0.4})`);
            trailGradient.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`);
            
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.arc(t.x, t.y, trailSize * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Outer glow (large) - Bigger for sniper
        const glowMultiplier = b.color === '#ff00ff' ? 4 : (b.piercing ? 3.5 : 3);
        const outerGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * glowMultiplier);
        outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${bl}, 0.4)`);
        outerGlow.addColorStop(0.5, `rgba(${r}, ${g}, ${bl}, 0.2)`);
        outerGlow.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`);
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * glowMultiplier, 0, Math.PI * 2);
        ctx.fill();
        
        // Middle glow - Brighter colors for each weapon
        const middleGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 1.8);
        
        // Different glow colors for different weapons
        if (b.color === '#ff00ff') {
            // Sniper - Purple/Pink glow
            middleGlow.addColorStop(0, 'rgba(255, 100, 255, 0.9)');
            middleGlow.addColorStop(0.6, 'rgba(255, 0, 255, 0.7)');
        } else if (b.piercing) {
            // Laser - Cyan glow
            middleGlow.addColorStop(0, 'rgba(100, 255, 255, 0.9)');
            middleGlow.addColorStop(0.6, 'rgba(0, 255, 255, 0.7)');
        } else if (b.color === '#ff9800') {
            // Shotgun - Orange glow
            middleGlow.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
            middleGlow.addColorStop(0.6, 'rgba(255, 152, 0, 0.6)');
        } else {
            // Normal - Green glow
            middleGlow.addColorStop(0, 'rgba(200, 255, 100, 0.8)');
            middleGlow.addColorStop(0.6, 'rgba(118, 255, 3, 0.6)');
        }
        middleGlow.addColorStop(1, `rgba(${r}, ${g}, ${bl}, 0)`);
        
        ctx.fillStyle = middleGlow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Main bullet body - Different shapes for different weapons
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        
        // Different bullet shapes based on weapon type
        if (b.color === '#ff00ff') {
            // SNIPER - Large elongated bullet with sharp tip
            const sniperGradient = ctx.createLinearGradient(-b.size * 2, 0, b.size * 0.5, 0);
            sniperGradient.addColorStop(0, 'rgba(255, 0, 255, 0.4)');
            sniperGradient.addColorStop(0.3, 'rgba(255, 100, 255, 1)');
            sniperGradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
            sniperGradient.addColorStop(1, 'rgba(255, 100, 255, 0.9)');
            
            ctx.fillStyle = sniperGradient;
            ctx.beginPath();
            // Elongated ellipse for sniper
            ctx.ellipse(0, 0, b.size * 2.5, b.size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Sharp tip
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.moveTo(b.size * 2, 0);
            ctx.lineTo(b.size * 1.5, -b.size * 0.4);
            ctx.lineTo(b.size * 1.5, b.size * 0.4);
            ctx.closePath();
            ctx.fill();
            
        } else if (b.piercing) {
            // LASER - Thin, long beam
            const laserGradient = ctx.createLinearGradient(-b.size * 3, 0, b.size * 0.5, 0);
            laserGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
            laserGradient.addColorStop(0.3, 'rgba(100, 255, 255, 1)');
            laserGradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
            laserGradient.addColorStop(1, 'rgba(100, 255, 255, 0.9)');
            
            ctx.fillStyle = laserGradient;
            ctx.beginPath();
            // Very thin and long for laser
            ctx.ellipse(0, 0, b.size * 3, b.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Laser core line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-b.size * 3, 0);
            ctx.lineTo(b.size * 0.5, 0);
            ctx.stroke();
            
        } else if (b.color === '#ff9800') {
            // SHOTGUN - Small round pellets
            const shotgunGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size);
            shotgunGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            shotgunGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.9)');
            shotgunGradient.addColorStop(1, 'rgba(255, 152, 0, 0.7)');
            
            ctx.fillStyle = shotgunGradient;
            ctx.beginPath();
            // Round pellet
            ctx.arc(0, 0, b.size, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // NORMAL - Standard energy bolt
            const boltGradient = ctx.createLinearGradient(-b.size * 1.5, 0, b.size * 0.5, 0);
            boltGradient.addColorStop(0, 'rgba(118, 255, 3, 0.3)');
            boltGradient.addColorStop(0.3, 'rgba(200, 255, 100, 1)');
            boltGradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
            boltGradient.addColorStop(1, 'rgba(200, 255, 100, 0.8)');
            
            ctx.fillStyle = boltGradient;
            ctx.beginPath();
            ctx.ellipse(0, 0, b.size * 1.5, b.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Core (bright white center) - For all bullets
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, b.size * 0.5);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        
        if (b.color === '#ff00ff') {
            coreGradient.addColorStop(0.5, 'rgba(255, 200, 255, 0.9)');
            coreGradient.addColorStop(1, 'rgba(255, 0, 255, 0.6)');
        } else if (b.piercing) {
            coreGradient.addColorStop(0.5, 'rgba(200, 255, 255, 0.9)');
            coreGradient.addColorStop(1, 'rgba(0, 255, 255, 0.6)');
        } else if (b.color === '#ff9800') {
            coreGradient.addColorStop(0.5, 'rgba(255, 220, 200, 0.9)');
            coreGradient.addColorStop(1, 'rgba(255, 152, 0, 0.6)');
        } else {
            coreGradient.addColorStop(0.5, 'rgba(200, 255, 200, 0.9)');
            coreGradient.addColorStop(1, 'rgba(118, 255, 3, 0.6)');
        }
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, b.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Energy sparks (animated)
        if (gameTime % 3 === 0) {
            for (let i = 0; i < 3; i++) {
                const sparkAngle = (Math.PI * 2 / 3) * i + gameTime * 0.1;
                const sparkDist = b.size * 0.8;
                const sparkX = Math.cos(sparkAngle) * sparkDist;
                const sparkY = Math.sin(sparkAngle) * sparkDist;
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, b.size * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
        
        // Crit effect (if crit bullet)
        if (b.isCrit) {
            const critGlow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size * 4);
            critGlow.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
            critGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
            critGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.fillStyle = critGlow;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
}

function drawParticles() {
    for (let p of hitParticles) {
        ctx.save();
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Draw based on particle type
        if (p.type === 'star') {
            // Draw star shape
            ctx.fillStyle = p.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                const x = Math.cos(angle) * p.size;
                const y = Math.sin(angle) * p.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (p.size * 0.4);
                const innerY = Math.sin(innerAngle) * (p.size * 0.4);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
        } else if (p.type === 'square') {
            // Draw square
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else {
            // Draw circle with glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color + '80');
            gradient.addColorStop(1, p.color + '00');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function drawPowerUps() {
    for (let p of powerUps) {
        // Skip if blinking (about to expire)
        if (p.life < 100 && p.life % 10 < 5) continue;
        
        ctx.save();
        
        // Power-up colors and icons
        let color = "#00ffff";
        let icon = '⭐';
        
        if (p.type === 'shield') { color = "#00ffff"; icon = '🛡️'; }
        else if (p.type === 'speed') { color = "#ffff00"; icon = '⚡'; }
        else if (p.type === 'rapidFire') { color = "#ff6600"; icon = '🔥'; }
        else if (p.type === 'health') { color = "#ff0066"; icon = '❤️'; }
        else if (p.type === 'damage') { color = "#ff0000"; icon = '⚔️'; }
        else if (p.type === 'multiShot') { color = "#ff00ff"; icon = '🎯'; }
        
        // Pulsing glow effect
        const pulseSize = Math.sin(p.pulse) * 3 + p.size;
        
        // Outer glow
        const outerGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulseSize * 2);
        outerGlow.addColorStop(0, color + '80');
        outerGlow.addColorStop(0.5, color + '40');
        outerGlow.addColorStop(1, color + '00');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main circle with rotation
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        
        // Background circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Icon
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, 0, 0);
        
        ctx.restore();
    }
}

function drawFloatingTexts() {
    for (let t of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = t.life / t.maxLife;
        ctx.fillStyle = t.color;
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        // NO SHADOW for performance!
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    }
}

function drawDrops() {
    for (let d of drops) {
        ctx.save();
        
        // Simple drops - NO GLOW for performance!
        ctx.fillStyle = d.type === 'coin' ? "#ffd700" : "#00ffff";
        ctx.beginPath();
        ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.type === 'coin' ? '💰' : '💎', d.x, d.y);
        ctx.restore();
    }
}

function drawExplosions() {
    for (let e of explosions) {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife;
        // Simple explosion - NO GRADIENT for performance!
        ctx.fillStyle = "#ff9600";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function drawAbilityUI() {
    ctx.save();
    
    // Dash cooldown
    const dashX = 20;
    const dashY = canvas.height - 80;
    const dashReady = player.dashCooldown === 0;
    
    ctx.fillStyle = dashReady ? "rgba(0, 255, 255, 0.3)" : "rgba(100, 100, 100, 0.3)";
    ctx.fillRect(dashX, dashY, 50, 50);
    ctx.strokeStyle = dashReady ? "#00ffff" : "#666";
    ctx.lineWidth = 3;
    ctx.strokeRect(dashX, dashY, 50, 50);
    
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff";
    ctx.fillText("💨", dashX + 25, dashY + 20);
    ctx.font = "10px Arial";
    ctx.fillText("SHIFT", dashX + 25, dashY + 40);
    
    if (!dashReady) {
        const cooldownPercent = 1 - (player.dashCooldown / 180);
        ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
        ctx.fillRect(dashX, dashY + 50 - (50 * cooldownPercent), 50, 50 * cooldownPercent);
    }
    
    // Ultimate charge
    const ultX = 80;
    const ultY = canvas.height - 80;
    const ultReady = player.ultimateCharge >= 100;
    
    ctx.fillStyle = ultReady ? "rgba(255, 255, 0, 0.3)" : "rgba(100, 100, 100, 0.3)";
    ctx.fillRect(ultX, ultY, 50, 50);
    ctx.strokeStyle = ultReady ? "#ffff00" : "#666";
    ctx.lineWidth = 3;
    ctx.strokeRect(ultX, ultY, 50, 50);
    
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("⚡", ultX + 25, ultY + 20);
    ctx.font = "10px Arial";
    ctx.fillText("Q", ultX + 25, ultY + 40);
    
    // Charge bar
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillRect(ultX, ultY + 50 - (50 * player.ultimateCharge / 100), 50, 50 * player.ultimateCharge / 100);
    
    ctx.restore();
}

// ========================================
// HUD
// ========================================

function updateHUD() {
    const seconds = Math.floor(gameTime / 60);
    timeInfo.textContent = `⏱️ ${seconds}s`;
    enemyInfo.textContent = `👾 ${enemies.length}`;
    scoreInfo.textContent = `🎯 ${score} (x${combo})`;
    healthInfo.textContent = `❤️ ${player.health}/${player.maxHealth}`;
    waveInfo.textContent = `🎮 LV${currentLevel} [${levelProgress}/${enemiesRequiredForLevel}] | 💰${player.coins} 💎${player.gems}`;
}

function drawStreakUI() {
    if (player.killStreak > 0) {
        ctx.save();
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = player.killStreak >= 10 ? "#ff0000" : "#ffaa00";
        // NO SHADOW for performance!
        ctx.fillText(`🔥 ${player.killStreak} STREAK`, canvas.width / 2, 30);
        ctx.restore();
    }
}

function drawLevelProgressBar() {
    ctx.save();
    
    // Progress bar at top
    const barWidth = 200;
    const barHeight = 20;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 10;
    
    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);
    
    // Border
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Progress fill
    const progress = Math.min(levelProgress / enemiesRequiredForLevel, 1);
    const fillWidth = barWidth * progress;
    
    const gradient = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(0.5, "#00ffff");
    gradient.addColorStop(1, "#0088ff");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, fillWidth, barHeight);
    
    // Level text
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`LEVEL ${currentLevel}`, canvas.width / 2, barY + 15);
    
    ctx.restore();
}

function drawLevelTransition() {
    if (levelTransitioning && levelTransitionTimer > 0) {
        ctx.save();
        
        // Flash effect
        const alpha = Math.sin(levelTransitionTimer * 0.2) * 0.3 + 0.3;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Big level text
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffff00";
        const scale = 1 + Math.sin(levelTransitionTimer * 0.1) * 0.1;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.fillText(`LEVEL ${currentLevel}!`, 0, 0);
        ctx.restore();
        
        levelTransitionTimer--;
        if (levelTransitionTimer === 0) {
            levelTransitioning = false;
        }
        
        ctx.restore();
    }
}

function drawSlowMotionEffect() {
    if (slowMotion) {
        ctx.save();
        // Lighter overlay for performance
        ctx.fillStyle = "rgba(0, 100, 255, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#00ffff";
        // NO SHADOW for performance!
        ctx.fillText("⏱️ SLOW MOTION", canvas.width / 2, 60);
        ctx.restore();
    }
}

function drawMiniMap() {
    if (!isRunning || isGameOver) return;
    
    // Get or create canvas inside miniMap div
    let mapCanvas = miniMap.querySelector('canvas');
    if (!mapCanvas) {
        mapCanvas = document.createElement('canvas');
        mapCanvas.width = 150;
        mapCanvas.height = 100;
        miniMap.innerHTML = '';
        miniMap.appendChild(mapCanvas);
    }
    
    const mapCtx = mapCanvas.getContext('2d');
    if (!mapCtx) return;
    
    const scaleX = 150 / canvas.width;
    const scaleY = 100 / canvas.height;
    
    // Clear
    mapCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    mapCtx.fillRect(0, 0, 150, 100);
    
    // Draw enemies
    mapCtx.fillStyle = '#ff5252';
    for (let enemy of enemies) {
        const x = enemy.x * scaleX;
        const y = enemy.y * scaleY;
        mapCtx.fillRect(x - 2, y - 2, 4, 4);
    }
    
    // Draw player
    mapCtx.fillStyle = '#00ffff';
    const px = player.x * scaleX;
    const py = player.y * scaleY;
    mapCtx.fillRect(px - 3, py - 3, 6, 6);
    
    // Draw power-ups
    mapCtx.fillStyle = '#ffff00';
    for (let p of powerUps) {
        const x = p.x * scaleX;
        const y = p.y * scaleY;
        mapCtx.fillRect(x - 1, y - 1, 2, 2);
    }
}

// ========================================
// MAIN GAME LOOP
// ========================================

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isRunning) {
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawPowerUps();
        drawParticles();
        drawFloatingTexts();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (isPaused) {
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawPowerUps();
        drawParticles();
        drawFloatingTexts();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (isGameOver) {
        drawPlayer();
        drawEnemies();
        drawBullets();
        drawPowerUps();
        updateParticles();
        drawParticles();
        updateFloatingTexts();
        drawFloatingTexts();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // Game running
    gameTime++;
    
    // Track no-damage time for challenges
    noDamageTime++;
    
    // Slow motion effect
    if (slowMotionTimer > 0) {
        slowMotionTimer--;
        if (slowMotionTimer === 0) slowMotion = false;
    }
    
    // Screen shake
    if (screenShake > 0) {
        screenShake--;
        ctx.save();
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
    }
    
    const timeScale = slowMotion ? 0.3 : 1;
    
    // Update (with time scale for slow motion)
    for (let i = 0; i < timeScale; i += 0.1) {
        if (Math.random() < timeScale) {
            updatePlayer();
            updateBullets();
            updateEnemies();
            updatePowerUps();
            updateDrops();
        }
    }
    
    updateParticles();
    updateFloatingTexts();
    updateExplosions();
    updateBackgroundStars();
    
    // Spawn trail particles for player movement
    if (Math.abs(player.vx) > 1) {
        spawnTrailParticle(player.x, player.y, '#00ffff');
    }
    
    // Spawn enemies
    spawnTimer++;
    if (spawnTimer >= spawnInterval) {
        spawnEnemy();
        spawnTimer = 0;
        if (spawnInterval > 120) spawnInterval--; // BAHUT slow spawning - easy game!
    }
    
    // Boss wave every 30 seconds
    if (gameTime % 1800 === 0 && !bossActive) {
        bossActive = true;
        wave++;
        spawnEnemy(true);
    }
    
    // Spawn power-ups
    powerUpTimer++;
    if (powerUpTimer >= 240) { // HAR 4 SECONDS - BAHUT ZYADA power-ups!
        spawnPowerUp();
        powerUpTimer = 0;
    }
    
    // Collisions
    checkBulletCollisions();
    checkPlayerCollision();
    
    // Combo decay
    if (combo > 1) {
        comboTimer--;
        if (comboTimer <= 0) combo = 1;
    }
    
    // Check achievements
    checkAchievements();
    
    // Check level progress
    checkLevelProgress();
    
    // Draw
    drawBackgroundStars();
    drawExplosions();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawPowerUps();
    drawDrops();
    drawParticles();
    drawFloatingTexts();
    drawAbilityUI();
    drawStreakUI();
    drawLevelProgressBar();
    drawLevelTransition();
    drawSlowMotionEffect();
    drawScreenFlash();
    // drawMiniMap(); // DISABLED for performance!
    updateHUD();
    
    if (screenShake > 0) {
        ctx.restore();
    }
    
    requestAnimationFrame(gameLoop);
}

// ========================================
// INITIALIZATION
// ========================================

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Game initializing...');
    
    // Verify DOM elements exist
    if (!startScreen) {
        console.error('❌ Start screen element not found!');
        return;
    }
    
    console.log('✅ Game ready - No login required!');
    
    console.log('🎮 Game initialization complete!');
});

// Start the game loop
gameLoop();
