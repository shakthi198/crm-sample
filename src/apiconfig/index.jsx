const API_BASE_URL = "http://localhost/crm/api";
const apiEndpoints = {
    baseUrl: API_BASE_URL,
    login: `${API_BASE_URL}/login.php`,
    roles: `${API_BASE_URL}/roles.php`,
    users: `${API_BASE_URL}/users.php`,
    create: `${API_BASE_URL}/create.php`,
    organizations: `${API_BASE_URL}/organizations.php`,
    clients: `${API_BASE_URL}/clients_page.php`,
    followup: `${API_BASE_URL}/followup_page.php`,
    leads: `${API_BASE_URL}/leads_page.php`,
    budget: `${API_BASE_URL}/budget.php`,
};

export default apiEndpoints;