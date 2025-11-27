// ========================================
// ADMIN DASHBOARD - NEON SURVIVAL
// ========================================

// Admin credentials (In production, use proper backend authentication)
const ADMIN_USERNAME = 'Naved Alam';
const ADMIN_PASSWORD = '@Naved786';

// DOM Elements
const adminLoginScreen = document.getElementById('adminLoginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const logoutAdminBtn = document.getElementById('logoutAdminBtn');
const adminNameEl = document.getElementById('adminName');

// Stats elements
const totalUsersEl = document.getElementById('totalUsers');
const approvedUsersEl = document.getElementById('approvedUsers');
const pendingUsersEl = document.getElementById('pendingUsers');
const blockedUsersEl = document.getElementById('blockedUsers');

// Table bodies
const pendingTableBody = document.getElementById('pendingTableBody');
const approvedTableBody = document.getElementById('approvedTableBody');
const blockedTableBody = document.getElementById('blockedTableBody');
const allTableBody = document.getElementById('allTableBody');

// Tab buttons
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// ========================================
// ADMIN LOGIN
// ========================================

adminLoginBtn.addEventListener('click', () => {
    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();
    
    console.log('🔐 Admin login attempt...');
    
    // Validate inputs
    if (!username || !password) {
        alert('⚠️ Please enter both username and password!');
        return;
    }
    
    // Check both username and password
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        console.log('✅ Admin login successful');
        adminLoginScreen.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        adminNameEl.textContent = `Welcome, ${ADMIN_USERNAME}`;
        loadDashboard();
        
        // Clear inputs
        adminUsername.value = '';
        adminPassword.value = '';
    } else {
        console.log('❌ Admin login failed');
        
        // Show specific error message
        if (username !== ADMIN_USERNAME && password !== ADMIN_PASSWORD) {
            alert('❌ Invalid username and password!\n\nPlease check your credentials and try again.');
        } else if (username !== ADMIN_USERNAME) {
            alert('❌ Invalid username!\n\nExpected: Admin name');
        } else {
            alert('❌ Invalid password!\n\nPlease check your password and try again.');
        }
        
        // Clear password only (keep username for retry)
        adminPassword.value = '';
        adminPassword.focus();
    }
});

// Enter key to login
adminUsername.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        adminPassword.focus();
    }
});

adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        adminLoginBtn.click();
    }
});

// Logout
logoutAdminBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        adminDashboard.classList.add('hidden');
        adminLoginScreen.classList.remove('hidden');
        adminUsername.value = '';
        adminPassword.value = '';
        adminUsername.focus();
    }
});

// ========================================
// TAB SWITCHING
// ========================================

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked
        btn.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

// Get all users from localStorage
function getAllUsers() {
    const users = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith('neonSurvival_user_')) {
            try {
                const userData = JSON.parse(localStorage.getItem(key));
                
                // Add status if not exists
                if (!userData.status) {
                    userData.status = 'pending'; // Default status
                    localStorage.setItem(key, JSON.stringify(userData));
                }
                
                users.push(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    return users;
}

// Update user status
function updateUserStatus(identifier, status) {
    const key = `neonSurvival_user_${identifier}`;
    const userData = JSON.parse(localStorage.getItem(key));
    
    if (userData) {
        userData.status = status;
        userData.statusUpdated = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(userData));
        return true;
    }
    return false;
}

// Delete user
function deleteUser(identifier) {
    const key = `neonSurvival_user_${identifier}`;
    localStorage.removeItem(key);
    
    // Also remove if it's the current user
    const currentUser = localStorage.getItem('neonSurvival_currentUser');
    if (currentUser === identifier) {
        localStorage.removeItem('neonSurvival_currentUser');
    }
}

// ========================================
// DASHBOARD FUNCTIONS
// ========================================

function loadDashboard() {
    const users = getAllUsers();
    
    // Update stats
    const pending = users.filter(u => u.status === 'pending').length;
    const approved = users.filter(u => u.status === 'approved').length;
    const blocked = users.filter(u => u.status === 'blocked').length;
    
    totalUsersEl.textContent = users.length;
    approvedUsersEl.textContent = approved;
    pendingUsersEl.textContent = pending;
    blockedUsersEl.textContent = blocked;
    
    // Load tables
    loadPendingUsers(users);
    loadApprovedUsers(users);
    loadBlockedUsers(users);
    loadAllUsers(users);
}

function loadPendingUsers(users) {
    const pending = users.filter(u => u.status === 'pending');
    
    if (pending.length === 0) {
        pendingTableBody.innerHTML = '<tr><td colspan="5" class="no-data">No pending users</td></tr>';
        return;
    }
    
    pendingTableBody.innerHTML = pending.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${getLoginTypeIcon(user.loginType)} ${user.loginType}</td>
            <td>${user.identifier}</td>
            <td>${formatDate(user.lastPlayed)}</td>
            <td>
                <button class="action-btn approve-btn" onclick="approveUser('${user.identifier}')">
                    ✅ Approve
                </button>
                <button class="action-btn reject-btn" onclick="blockUser('${user.identifier}')">
                    ❌ Block
                </button>
            </td>
        </tr>
    `).join('');
}

function loadApprovedUsers(users) {
    const approved = users.filter(u => u.status === 'approved');
    
    if (approved.length === 0) {
        approvedTableBody.innerHTML = '<tr><td colspan="6" class="no-data">No approved users</td></tr>';
        return;
    }
    
    approvedTableBody.innerHTML = approved.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${getLoginTypeIcon(user.loginType)} ${user.loginType}</td>
            <td>${user.highScore || 0}</td>
            <td>${user.totalGamesPlayed || 0}</td>
            <td>${formatDate(user.lastPlayed)}</td>
            <td>
                <button class="action-btn reject-btn" onclick="blockUser('${user.identifier}')">
                    ❌ Block
                </button>
                <button class="action-btn delete-btn" onclick="deleteUserConfirm('${user.identifier}')">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function loadBlockedUsers(users) {
    const blocked = users.filter(u => u.status === 'blocked');
    
    if (blocked.length === 0) {
        blockedTableBody.innerHTML = '<tr><td colspan="4" class="no-data">No blocked users</td></tr>';
        return;
    }
    
    blockedTableBody.innerHTML = blocked.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${getLoginTypeIcon(user.loginType)} ${user.loginType}</td>
            <td>${formatDate(user.statusUpdated || user.lastPlayed)}</td>
            <td>
                <button class="action-btn unblock-btn" onclick="approveUser('${user.identifier}')">
                    ✅ Unblock
                </button>
                <button class="action-btn delete-btn" onclick="deleteUserConfirm('${user.identifier}')">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function loadAllUsers(users) {
    if (users.length === 0) {
        allTableBody.innerHTML = '<tr><td colspan="6" class="no-data">No users found</td></tr>';
        return;
    }
    
    allTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td><span class="status-badge status-${user.status}">${user.status.toUpperCase()}</span></td>
            <td>${getLoginTypeIcon(user.loginType)} ${user.loginType}</td>
            <td>${user.highScore || 0}</td>
            <td>${user.totalGamesPlayed || 0}</td>
            <td>
                ${user.status === 'pending' ? `
                    <button class="action-btn approve-btn" onclick="approveUser('${user.identifier}')">✅</button>
                ` : ''}
                ${user.status === 'approved' ? `
                    <button class="action-btn reject-btn" onclick="blockUser('${user.identifier}')">❌</button>
                ` : ''}
                ${user.status === 'blocked' ? `
                    <button class="action-btn unblock-btn" onclick="approveUser('${user.identifier}')">✅</button>
                ` : ''}
                <button class="action-btn delete-btn" onclick="deleteUserConfirm('${user.identifier}')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// ========================================
// USER ACTIONS
// ========================================

function approveUser(identifier) {
    if (updateUserStatus(identifier, 'approved')) {
        alert('✅ User approved successfully!');
        loadDashboard();
    }
}

function blockUser(identifier) {
    if (confirm('Are you sure you want to block this user?')) {
        if (updateUserStatus(identifier, 'blocked')) {
            alert('❌ User blocked successfully!');
            loadDashboard();
        }
    }
}

function deleteUserConfirm(identifier) {
    if (confirm('⚠️ Are you sure you want to permanently delete this user? This action cannot be undone!')) {
        deleteUser(identifier);
        alert('🗑️ User deleted successfully!');
        loadDashboard();
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function getLoginTypeIcon(type) {
    switch(type) {
        case 'guest': return '👤';
        case 'mobile': return '📱';
        case 'google': return '🔐';
        default: return '❓';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

// ========================================
// AUTO REFRESH
// ========================================

// Refresh dashboard every 10 seconds
setInterval(() => {
    if (!adminDashboard.classList.contains('hidden')) {
        loadDashboard();
    }
}, 10000);
