const balanceDisplay = document.getElementById('balance');
const transactionsList = document.getElementById('transactions');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const chartCanvas = document.getElementById('expense-chart');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

function updateBalance() {
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    balanceDisplay.textContent = `₹${total.toFixed(2)}`;
}

function addTransaction() {
    const name = document.getElementById('transaction-name').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const date = document.getElementById('transaction-date').value;
    
    if (name && amount) {
        const transaction = {
            id: Date.now(),
            name,
            amount: category === 'income' ? amount : -amount,  // Positive for income, negative for expenses
            category,
            date
        };
        
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        displayTransactions();
        updateBalance();
        updateChart();
    }
}

function displayTransactions() {
    transactionsList.innerHTML = '';
    const filteredTransactions = transactions.filter(transaction => 
        (filterCategory.value === 'all' || transaction.category === filterCategory.value) &&
        (!filterDate.value || transaction.date === filterDate.value));
    
    filteredTransactions.forEach(transaction => {
        const li = document.createElement('li');
        li.className = transaction.amount > 0 ? 'income' : 'expense';
        li.innerHTML = `
            ${transaction.name} - ₹${Math.abs(transaction.amount).toFixed(2)} 
            <span>${transaction.date}</span>
            <button class="edit" onclick="editTransaction(${transaction.id})">Edit</button>
            <button class="delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
        `;
        transactionsList.appendChild(li);
    });
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    document.getElementById('transaction-name').value = transaction.name;
    document.getElementById('transaction-amount').value = Math.abs(transaction.amount);
    document.getElementById('transaction-category').value = transaction.category;
    document.getElementById('transaction-date').value = transaction.date;
    
    deleteTransaction(id);  // Remove the old transaction before updating
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    displayTransactions();
    updateBalance();
    updateChart();
}

function calculateCategorySums() {
    const categorySums = {
        income: 0,
        food: 0,
        utilities: 0,
        entertainment: 0
    };

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            categorySums.income += transaction.amount;
        } else {
            categorySums[transaction.category] += Math.abs(transaction.amount);
        }
    });

    return categorySums;
}

function updateChart() {
    const categorySums = calculateCategorySums();
    const chartData = {
        labels: ['Income', 'Food', 'Utilities', 'Entertainment'],
        datasets: [{
            label: 'Expenses by Category',
            data: [categorySums.income, categorySums.food, categorySums.utilities, categorySums.entertainment],
            backgroundColor: ['green', 'red', 'blue', 'orange'],
            hoverOffset: 4
        }]
    };

    if (chartInstance) {
        chartInstance.destroy();  // Destroy previous chart to avoid overlap
    }

    chartInstance = new Chart(chartCanvas, {
        type: 'pie',
        data: chartData
    });
}

addTransactionBtn.addEventListener('click', addTransaction);
filterCategory.addEventListener('change', displayTransactions);
filterDate.addEventListener('change', displayTransactions);

updateBalance();
displayTransactions();
updateChart();
