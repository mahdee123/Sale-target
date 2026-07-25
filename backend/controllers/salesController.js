const { getDb } = require('../config/database');

// Add sales entry (Salesman only)
const addSale = async (req, res) => {
    try {
        const { amount } = req.body;
        const salesman_id = req.user.id;
        const branch_id = req.user.branch_id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid sales amount is required.' });
        }

        if (!branch_id) {
            return res.status(400).json({ error: 'No branch assigned to your account.' });
        }

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const now = new Date();
        const sale_date = now.toISOString().split('T')[0];
        const sale_time = now.toTimeString().split(' ')[0];

        const result = await db.query(`
            INSERT INTO sales (salesman_id, branch_id, sale_date, sale_time, amount)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [salesman_id, branch_id, sale_date, sale_time, amount]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get own sales (Salesman)
const getMySales = async (req, res) => {
    try {
        const salesman_id = req.user.id;
        const { date, month, year } = req.query;

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        let query = 'SELECT * FROM sales WHERE salesman_id = $1';
        const params = [salesman_id];
        let paramIndex = 2;

        if (date) {
            query += ` AND sale_date = $${paramIndex}`;
            params.push(date);
            paramIndex++;
        } else if (month && year) {
            query += ` AND EXTRACT(YEAR FROM sale_date) = $${paramIndex} AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $${paramIndex + 1}`;
            params.push(year, month.padStart(2, '0'));
            paramIndex += 2;
        } else if (year) {
            query += ` AND EXTRACT(YEAR FROM sale_date) = $${paramIndex}`;
            params.push(year);
            paramIndex++;
        }

        query += ' ORDER BY sale_date DESC, sale_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all sales (Admin)
const getAllSales = async (req, res) => {
    try {
        const { branch_id, salesman_id, date, month, year, start_date, end_date } = req.query;

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        let query = `
            SELECT s.*, u.full_name as salesman_name, b.branch_name
            FROM sales s
            JOIN users u ON s.salesman_id = u.id
            JOIN branches b ON s.branch_id = b.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (branch_id) {
            query += ` AND s.branch_id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        if (salesman_id) {
            query += ` AND s.salesman_id = $${paramIndex}`;
            params.push(salesman_id);
            paramIndex++;
        }

        if (date) {
            query += ` AND s.sale_date = $${paramIndex}`;
            params.push(date);
            paramIndex++;
        } else if (start_date && end_date) {
            query += ` AND s.sale_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
            params.push(start_date, end_date);
            paramIndex += 2;
        } else if (month && year) {
            query += ` AND EXTRACT(YEAR FROM s.sale_date) = $${paramIndex} AND LPAD(EXTRACT(MONTH FROM s.sale_date)::text, 2, '0') = $${paramIndex + 1}`;
            params.push(year, month.padStart(2, '0'));
            paramIndex += 2;
        } else if (year) {
            query += ` AND EXTRACT(YEAR FROM s.sale_date) = $${paramIndex}`;
            params.push(year);
            paramIndex++;
        }

        query += ' ORDER BY s.sale_date DESC, s.sale_time DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete own sale (Salesman - same day only)
const deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const salesman_id = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const sale = await db.query('SELECT * FROM sales WHERE id = $1 AND salesman_id = $2', [id, salesman_id]);

        if (sale.rows.length === 0) {
            return res.status(404).json({ error: 'Sale entry not found.' });
        }

        if (sale.rows[0].sale_date !== today) {
            return res.status(400).json({ error: 'Cannot delete entries from previous days.' });
        }

        await db.query('DELETE FROM sales WHERE id = $1', [id]);
        res.json({ message: 'Sale entry deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Dashboard stats (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const monthStr = currentMonth.toString().padStart(2, '0');

        const totalBranches = (await db.query('SELECT COUNT(*) as count FROM branches')).rows[0].count;
        const totalSalesmen = (await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'salesman' AND status = 'active'")).rows[0].count;
        const todaySales = (await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE sale_date = $1", [today])).rows[0].total;
        const monthSales = (await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = $1 AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $2
        `, [currentYear.toString(), monthStr])).rows[0].total;

        const branchOverview = (await db.query(`
            SELECT b.id, b.branch_name,
                COALESCE((SELECT SUM(amount) FROM sales WHERE branch_id = b.id AND sale_date = $1), 0) as today_sale,
                COALESCE((SELECT SUM(amount) FROM sales WHERE branch_id = b.id
                    AND EXTRACT(YEAR FROM sale_date) = $2 AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $3), 0) as month_sale,
                (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND role = 'salesman' AND status = 'active') as salesman_count
            FROM branches b
            ORDER BY b.branch_name
        `, [today, currentYear.toString(), monthStr])).rows;

        res.json({
            total_branches: parseInt(totalBranches),
            total_salesmen: parseInt(totalSalesmen),
            today_sales: parseFloat(todaySales),
            month_sales: parseFloat(monthSales),
            branch_overview: branchOverview
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Daily report
const getDailyReport = async (req, res) => {
    try {
        const { branch_id, salesman_id, month, year } = req.query;
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const currentYear = year || new Date().getFullYear().toString();
        const currentMonth = (month || (new Date().getMonth() + 1)).toString().padStart(2, '0');

        let query = `
            SELECT sale_date::text,
                COUNT(*) as entries,
                SUM(amount) as daily_total
            FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = $1 AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $2
        `;
        const params = [currentYear, currentMonth];
        let paramIndex = 3;

        if (branch_id) {
            query += ` AND branch_id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        if (salesman_id) {
            query += ` AND salesman_id = $${paramIndex}`;
            params.push(salesman_id);
            paramIndex++;
        }

        query += ' GROUP BY sale_date ORDER BY sale_date';

        const dailyReport = (await db.query(query, params)).rows;
        const monthTotal = dailyReport.reduce((sum, day) => sum + parseFloat(day.daily_total), 0);

        res.json({
            year: currentYear,
            month: currentMonth,
            daily_report: dailyReport,
            month_total: monthTotal
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Monthly report
const getMonthlyReport = async (req, res) => {
    try {
        const { branch_id, salesman_id, year } = req.query;
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const currentYear = year || new Date().getFullYear().toString();

        let query = `
            SELECT LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') as month,
                COUNT(*) as total_entries,
                SUM(amount) as monthly_total
            FROM sales
            WHERE EXTRACT(YEAR FROM sale_date) = $1
        `;
        const params = [currentYear];
        let paramIndex = 2;

        if (branch_id) {
            query += ` AND branch_id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        if (salesman_id) {
            query += ` AND salesman_id = $${paramIndex}`;
            params.push(salesman_id);
            paramIndex++;
        }

        query += ' GROUP BY month ORDER BY month';

        const monthlyReport = (await db.query(query, params)).rows;
        const yearTotal = monthlyReport.reduce((sum, month) => sum + parseFloat(month.monthly_total), 0);

        res.json({
            year: currentYear,
            monthly_report: monthlyReport,
            year_total: yearTotal
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Salesman performance report
const getSalesmanPerformance = async (req, res) => {
    try {
        const { branch_id, month, year } = req.query;
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const today = new Date().toISOString().split('T')[0];
        const currentYear = year || new Date().getFullYear().toString();
        const currentMonth = month || (new Date().getMonth() + 1).toString().padStart(2, '0');

        let query = `
            SELECT u.id, u.full_name, b.branch_name,
                (SELECT COUNT(*) FROM sales WHERE salesman_id = u.id AND sale_date = $1) as today_entries,
                (SELECT COALESCE(SUM(amount), 0) FROM sales WHERE salesman_id = u.id AND sale_date = $1) as today_sales,
                (SELECT COALESCE(SUM(amount), 0) FROM sales WHERE salesman_id = u.id
                    AND EXTRACT(YEAR FROM sale_date) = $2 AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $3) as month_sales
            FROM users u
            LEFT JOIN branches b ON u.branch_id = b.id
            WHERE u.role = 'salesman' AND u.status = 'active'
        `;
        const params = [today, currentYear, currentMonth];
        let paramIndex = 4;

        if (branch_id) {
            query += ` AND u.branch_id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        query += ' ORDER BY u.full_name';

        const performance = (await db.query(query, params)).rows;
        res.json(performance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Branch report
const getBranchReport = async (req, res) => {
    try {
        const { branch_id, month, year } = req.query;
        const db = getDb();
        if (!db) return res.status(500).json({ error: 'Database not configured.' });

        const today = new Date().toISOString().split('T')[0];
        const currentYear = year || new Date().getFullYear().toString();
        const currentMonth = month || (new Date().getMonth() + 1).toString().padStart(2, '0');

        let branchesQuery = `
            SELECT b.*,
                (SELECT COUNT(*) FROM users WHERE branch_id = b.id AND role = 'salesman' AND status = 'active') as salesman_count,
                (SELECT COALESCE(SUM(amount), 0) FROM sales WHERE branch_id = b.id AND sale_date = $1) as today_sales,
                (SELECT COALESCE(SUM(amount), 0) FROM sales WHERE branch_id = b.id
                    AND EXTRACT(YEAR FROM sale_date) = $2 AND LPAD(EXTRACT(MONTH FROM sale_date)::text, 2, '0') = $3) as month_sales
            FROM branches b
        `;
        const params = [today, currentYear, currentMonth];
        let paramIndex = 4;

        if (branch_id) {
            branchesQuery += ` WHERE b.id = $${paramIndex}`;
            params.push(branch_id);
            paramIndex++;
        }

        branchesQuery += ' ORDER BY b.branch_name';

        const branches = (await db.query(branchesQuery, params)).rows;
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addSale,
    getMySales,
    getAllSales,
    deleteSale,
    getDashboardStats,
    getDailyReport,
    getMonthlyReport,
    getSalesmanPerformance,
    getBranchReport
};
