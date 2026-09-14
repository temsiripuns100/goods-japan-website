// Global Chart instances to allow destroying and recreating
let barChart = null;
let doughnutChart = null;

// Formatter for THB
const currencyFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0
});

// Mock Data for demonstration before Google Sheet is connected
const mockData = {
    monthly_target: 180000,
    current_sales: 65400,
    daily_sales: [
        { date: "01/09", sales: 4500 },
        { date: "02/09", sales: 3200 },
        { date: "03/09", sales: 8900 },
        { date: "04/09", sales: 5100 },
        { date: "05/09", sales: 2400 },
        { date: "06/09", sales: 12500 },
        { date: "07/09", sales: 9800 },
        { date: "08/09", sales: 6000 },
        { date: "09/09", sales: 4100 },
        { date: "10/09", sales: 8900 }
    ],
    inventory_alerts: [
        { id: "CMP-001", name: "เก้าอี้แคมป์ปิ้ง Kermit", stock: 2 },
        { id: "FSH-012", name: "รอกตกปลา Shimano", stock: 1 },
        { id: "CER-105", name: "ชุดถ้วยชาเซรามิก", stock: 3 },
        { id: "BIK-004", name: "จักรยานแม่บ้านญี่ปุ่น", stock: 0 }
    ]
};

// Fetch data from API or use Mock
async function fetchDashboardData() {
    const apiUrl = document.getElementById('apiUrl').value.trim();
    let data = mockData;
    let isConnected = false;

    if (apiUrl) {
        try {
            // Add loading state
            document.getElementById('kpi-target').innerText = "กำลังโหลด...";
            
            const response = await fetch(apiUrl);
            data = await response.json();
            isConnected = true;
        } catch (error) {
            console.error("Error fetching from Google Sheets API:", error);
            alert("ไม่สามารถดึงข้อมูลจาก Google Sheets ได้ หรือ URL ไม่ถูกต้อง จะใช้ข้อมูลจำลองแทน");
            data = mockData;
        }
    }

    // Update the warning text based on connection status
    const warningText = document.querySelector('.text-xs.text-gray-500');
    if (warningText) {
        if (isConnected) {
            warningText.innerHTML = '<span class="text-green-600 font-medium">✅ เชื่อมต่อกับ Google Sheets สำเร็จ</span>';
        } else {
            warningText.innerHTML = '* หมายเหตุ: ขณะนี้กำลังแสดงข้อมูลจำลอง (Mock Data) เนื่องจากยังไม่ได้เชื่อมต่อ หรือเกิดข้อผิดพลาด';
        }
    }

    updateDashboard(data);
}

function updateDashboard(data) {
    // 1. Calculate KPIs
    const target = parseFloat(data.monthly_target) || 0;
    const current = parseFloat(data.current_sales) || 0;
    const remaining = Math.max(0, target - current);
    
    // Calculate days remaining in the month (assuming current month)
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, daysInMonth - now.getDate());
    const dailyNeed = remaining / daysRemaining;

    // 2. Update KPI DOM elements
    document.getElementById('kpi-target').innerText = currencyFormatter.format(target);
    document.getElementById('kpi-current').innerText = currencyFormatter.format(current);
    document.getElementById('kpi-remaining').innerText = currencyFormatter.format(remaining);
    document.getElementById('kpi-daily-need').innerText = currencyFormatter.format(dailyNeed);

    // 3. Update Progress text
    const percentage = target > 0 ? ((current / target) * 100).toFixed(1) : 0;
    document.getElementById('progress-text').innerText = `${percentage}%`;

    // 4. Update Charts
    updateCharts(data, current, remaining);

    // 5. Update Inventory Table
    updateInventoryTable(data.inventory_alerts);
}

function updateCharts(data, current, remaining) {
    // Destroy existing charts if they exist
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();

    // Prepare Bar Chart Data
    const labels = data.daily_sales.map(item => item.date);
    const salesData = data.daily_sales.map(item => item.sales);

    const ctxBar = document.getElementById('dailySalesChart').getContext('2d');
    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'ยอดขาย (บาท)',
                data: salesData,
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
                borderColor: 'rgba(37, 99, 235, 1)', // blue-600
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Prepare Doughnut Chart Data
    const ctxDoughnut = document.getElementById('targetChart').getContext('2d');
    doughnutChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['ยอดขายที่ทำได้', 'ยอดที่ต้องทำเพิ่ม'],
            datasets: [{
                data: [current, remaining],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)', // green-500
                    'rgba(243, 244, 246, 1)'  // gray-100
                ],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateInventoryTable(inventoryItems) {
    const tbody = document.getElementById('inventory-table');
    tbody.innerHTML = "";

    if (!inventoryItems || inventoryItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-gray-500">ไม่มีสินค้าคงคลังใกล้หมด</td></tr>`;
        return;
    }

    inventoryItems.forEach(item => {
        // Determine status color
        let statusBadge = '';
        if (item.stock <= 0) {
            statusBadge = `<span class="bg-red-200 text-red-700 py-1 px-3 rounded-full text-xs">หมดสต๊อก</span>`;
        } else {
            statusBadge = `<span class="bg-orange-200 text-orange-700 py-1 px-3 rounded-full text-xs">ใกล้หมด</span>`;
        }

        const row = `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="py-3 px-6 text-left whitespace-nowrap font-medium">${item.id}</td>
                <td class="py-3 px-6 text-left">${item.name}</td>
                <td class="py-3 px-6 text-center text-red-500 font-bold">${item.stock}</td>
                <td class="py-3 px-6 text-center">${statusBadge}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// Initial load with mock data
window.onload = () => {
    fetchDashboardData();
};
