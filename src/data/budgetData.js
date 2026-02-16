export const mockBudgets = [
    {
        id: 1,
        leadName: 'Acme Corp',
        estimatedAmount: 50000,
        discount: 5000,
        finalAmount: 45000,
        status: 'Approved',
        date: '2023-10-15',
    },
    {
        id: 2,
        leadName: 'Global Tech Solutions',
        estimatedAmount: 120000,
        discount: 10000,
        finalAmount: 110000,
        status: 'Pending',
        date: '2023-10-18',
    },
    {
        id: 3,
        leadName: 'Stark Industries',
        estimatedAmount: 75000,
        discount: 0,
        finalAmount: 75000,
        status: 'Rejected',
        date: '2023-10-20',
    },
    {
        id: 4,
        leadName: 'Wayne Enterprises',
        estimatedAmount: 200000,
        discount: 20000,
        finalAmount: 180000,
        status: 'Pending',
        date: '2023-10-22',
    },
    {
        id: 5,
        leadName: 'Cyberdyne Systems',
        estimatedAmount: 30000,
        discount: 2000,
        finalAmount: 28000,
        status: 'Approved',
        date: '2023-10-25',
    },
];

export const mockSummary = {
    totalBudget: 438000,
    approvedCount: 2,
    pendingCount: 2,
    rejectedCount: 1,
};
