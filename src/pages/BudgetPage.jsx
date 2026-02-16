import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SummaryCards from '../components/SummaryCards';
import BudgetTable from '../components/BudgetTable';
import BudgetModal from '../components/BudgetModal';
import PageContainer from '../components/PageContainer';
import DataTableCard from '../components/DataTableCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { mockBudgets, mockSummary } from '../data/budgetData.js';
import { useAuth } from '../context/AuthContext.jsx';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

const BudgetPage = () => {
    const theme = useTheme();
    const { hasPermission } = useAuth();
    const [budgets, setBudgets] = useState(mockBudgets);
    const [summary, setSummary] = useState(mockSummary);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    
        // Simulate loading delay
        useEffect(() => {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }, []);

    // Recalculate summary when budgets change
    useEffect(() => {
        const total = budgets.reduce((acc, curr) => acc + curr.finalAmount, 0);
        const approved = budgets.filter(b => b.status === 'Approved').length;
        const pending = budgets.filter(b => b.status === 'Pending').length;
        const rejected = budgets.filter(b => b.status === 'Rejected').length;

        setSummary({
            totalBudget: total,
            approvedCount: approved,
            pendingCount: pending,
            rejectedCount: rejected
        });
    }, [budgets]);

    const handleAddClick = () => {
        setCurrentBudget(null);
        setModalOpen(true);
    };

    const handleEditClick = (budget) => {
        setCurrentBudget(budget);
        setModalOpen(true);
    };

    const handleSaveBudget = (budgetData) => {
        if (budgetData.id) {
            // Edit existing
            setBudgets(budgets.map(b => b.id === budgetData.id ? { ...b, ...budgetData } : b));
        } else {
            // Add new
            const newBudget = {
                ...budgetData,
                id: budgets.length + 1,
                date: new Date().toISOString().split('T')[0]
            };
            setBudgets([...budgets, newBudget]);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        setBudgets(budgets.map(b => b.id === id ? { ...b, status: newStatus } : b));
    };

    const summaryItems = [
        {
            title: 'Total Budget Amount',
            value: `₹${summary.totalBudget.toLocaleString()} `,
            icon: <MonetizationOnIcon sx={{ fontSize: 32 }} />,
            color: theme.palette.primary.main,
        },
        {
            title: 'Approved Budgets',
            value: summary.approvedCount,
            icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
            color: theme.palette.success.main,
        },
        {
            title: 'Pending Budgets',
            value: summary.pendingCount,
            icon: <PendingIcon sx={{ fontSize: 32 }} />,
            color: theme.palette.warning.main,
        },
        {
            title: 'Rejected Budgets',
            value: summary.rejectedCount,
            icon: <CancelIcon sx={{ fontSize: 32 }} />, // Changed to CancelIcon
            color: theme.palette.error.main, // Changed to error.main
        }
    ];
    if (loading) {
        return <LoadingSpinner loading={true} mode="centered" message="Loading budgets..." />
    }

    return (
        <PageContainer
            title="Budget Management"
            subtitle="Manage and track budget approvals for client projects."
            action={
                hasPermission('edit_budget') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                    >
                        Add Budget
                    </Button>
                )
            }
        >
            {/* Summary Cards */}
            <SummaryCards items={summaryItems} />

            {/* Budget Table */}
            <DataTableCard>
                <BudgetTable
                    budgets={budgets}
                    onEdit={handleEditClick}
                    onStatusChange={handleStatusChange}
                />
            </DataTableCard>

            {/* Add/Edit Modal */}
            <BudgetModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveBudget}
                budget={currentBudget}
            />
        </PageContainer>
    );
};

export default BudgetPage;

