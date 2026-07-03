document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const dashboard = document.getElementById('dashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Lead Form Elements
    const formTitle = document.getElementById('formTitle');
    const editIndexField = document.getElementById('editIndex');
    const leadName = document.getElementById('leadName');
    const leadEmail = document.getElementById('leadEmail');
    const leadPhone = document.getElementById('leadPhone');
    const addLeadBtn = document.getElementById('addLeadBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    // Table and Search
    const leadTable = document.getElementById('leadTable');
    const searchBar = document.getElementById('searchBar');

    // ==================== DYNAMIC STATE VARIABLES ====================
    let leads = JSON.parse(localStorage.getItem('leads')) || [];
    // Dynamically store multiple users in LocalStorage instead of a static 'admin'
    let users = JSON.parse(localStorage.getItem('system_users')) || {}; 
    let isEditing = false;

    // Persist login state across refreshes
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }

    // ==================== DYNAMIC AUTH LOGIC ====================
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert('Please fill out all fields.');
            return;
        }

        // Check if user exists in our dynamic database
        if (users[username]) {
            // User exists -> Check password
            if (users[username] === password) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', username);
                showDashboard();
                clearAuthInputs();
            } else {
                alert('Incorrect password. Please try again.');
            }
        } else {
            // Dynamic Registration Workflow if user is missing
            const registerConfirm = confirm(`The username "${username}" does not exist. Would you like to dynamically register this account?`);
            if (registerConfirm) {
                users[username] = password; // Dynamically add user
                localStorage.setItem('system_users', JSON.stringify(users)); // Save to storage
                alert('Registration successful! You can now log in.');
            }
        }
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('currentUser');
        hideDashboard();
    });

    function showDashboard() {
        loginContainer.style.display = 'none';
        dashboard.style.display = 'grid'; // Matches your premium sidebar CSS layout grid
        renderLeads();
    }

    function hideDashboard() {
        loginContainer.style.display = 'flex';
        dashboard.style.display = 'none';
    }

    function clearAuthInputs() {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    // ==================== CRUD OPERATIONS ====================
    
    function updateData() {
        localStorage.setItem('leads', JSON.stringify(leads));
        renderLeads();
    }

    function renderLeads(filterText = '') {
        leadTable.innerHTML = '';
        
        leads.forEach((lead, index) => {
            if (
                lead.name.toLowerCase().includes(filterText.toLowerCase()) ||
                lead.email.toLowerCase().includes(filterText.toLowerCase())
            ) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${lead.name}</td>
                    <td>${lead.email}</td>
                    <td>${lead.phone}</td>
                    <td class="action-btns">
                        <button class="edit-btn" onclick="prepareEdit(${index})">Edit</button>
                        <button class="delete-btn" onclick="deleteLead(${index})">Delete</button>
                    </td>
                `;
                leadTable.appendChild(tr);
            }
        });
    }

    addLeadBtn.addEventListener('click', () => {
        const name = leadName.value.trim();
        const email = leadEmail.value.trim();
        const phone = leadPhone.value.trim();

        if (!name || !email || !phone) {
            alert('Please fill out all lead data fields.');
            return;
        }

        const leadData = { name, email, phone };

        if (isEditing) {
            const index = editIndexField.value;
            leads[index] = leadData;
            resetForm();
        } else {
            leads.push(leadData);
        }

        updateData();
        clearInputs();
    });

    window.deleteLead = function(index) {
        if(confirm('Are you sure you want to delete this lead?')) {
            leads.splice(index, 1);
            updateData();
            if (isEditing && editIndexField.value == index) {
                resetForm();
            }
        }
    };

    window.prepareEdit = function(index) {
        isEditing = true;
        formTitle.textContent = "Edit Lead Details";
        addLeadBtn.textContent = "Update Lead";
        cancelEditBtn.style.display = "block";
        
        editIndexField.value = index;
        leadName.value = leads[index].name;
        leadEmail.value = leads[index].email;
        leadPhone.value = leads[index].phone;
    };

    cancelEditBtn.addEventListener('click', resetForm);

    function resetForm() {
        isEditing = false;
        formTitle.textContent = "Add New Lead";
        addLeadBtn.textContent = "Add Lead";
        cancelEditBtn.style.display = "none";
        clearInputs();
    }

    function clearInputs() {
        editIndexField.value = '';
        leadName.value = '';
        leadEmail.value = '';
        leadPhone.value = '';
    }

    // ==================== LIVE SEARCH ====================
    searchBar.addEventListener('input', (e) => {
        renderLeads(e.target.value);
    });
});