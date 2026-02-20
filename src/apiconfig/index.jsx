const API_BASE_URL = "http://localhost/crm";
const apiEndpoints = {
  baseUrl: API_BASE_URL,
  login: `${API_BASE_URL}/login.php`,
  roles: `${API_BASE_URL}/roles.php`,
  users: `${API_BASE_URL}/users.php`,
  create: `${API_BASE_URL}/create.php`,
  organizations: `${API_BASE_URL}/organizations.php`,
  clients: `${API_BASE_URL}/clients_page.php`,
  followup: `${API_BASE_URL}/followup_page.php`,
  budget: `${API_BASE_URL}/budget.php`,
  leads: `${API_BASE_URL}/leads.php`,
  usersdropdown: `${API_BASE_URL}/users_dropdown.php`,
  dropdown: `${API_BASE_URL}/dropdown.php`,
  dashboard: `${API_BASE_URL}/dashboard.php`,
  attendance: `${API_BASE_URL}/attendance.php`,
  addSalaryDetails: `${API_BASE_URL}/add-salary-details.php`,
  getAllSalaryDetails: `${API_BASE_URL}/get-all-salary-details.php`,
  updateSalaryStatus: `${API_BASE_URL}/update-salary-status.php`,
  getSalaryStatus: `${API_BASE_URL}/get-salary-status.php`,
  addAdvanceEntry: `${API_BASE_URL}/add-advance-entry.php`,
  getAdvanceHistory: `${API_BASE_URL}/get-advance-history.php`,
  reports: `${API_BASE_URL}/reports.php`,
};

export default apiEndpoints;