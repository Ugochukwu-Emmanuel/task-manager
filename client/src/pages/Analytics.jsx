import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import './Analytics.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
const API_URL = `${API_BASE}/api/analytics`;

// Colors mirrored from index.css tokens — recharts needs literal values,
// it can't read CSS custom properties directly.
const COLORS = {
  ember: '#d8602f',
  gold: '#b9862f',
  moss: '#48734f',
  slate: '#5b6472',
  ink: '#1b1f2b',
  danger: '#b7412c',
};

const STATUS_COLORS = {
  pending: COLORS.slate,
  'in-progress': COLORS.gold,
  completed: COLORS.moss,
};

const PRIORITY_COLORS = {
  high: COLORS.ember,
  medium: COLORS.gold,
  low: COLORS.moss,
};

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/summary`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/trend?days=30`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([summaryData, trendData]) => {
        setSummary(summaryData);
        setTrend(trendData);
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard__body">
        <Sidebar />
        <main className="dashboard__main analytics">
          <h2 className="analytics__heading">Analytics</h2>

          {loading && <p className="analytics__status">Loading…</p>}
          {error && <p className="analytics__status analytics__status--error">{error}</p>}

          {!loading && !error && (
            <>
              <section className="analytics__card">
                <h3>Created vs. completed — last 30 days</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ded5bd" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: COLORS.slate }}
                      tickFormatter={(d) => d.slice(5)} // MM-DD
                      interval={Math.ceil(trend.length / 8)}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: COLORS.slate }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke={COLORS.slate}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke={COLORS.moss}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </section>

              <div className="analytics__row">
                <section className="analytics__card analytics__card--half">
                  <h3>By category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={summary.byCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#ded5bd" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="category"
                        tick={{ fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill={COLORS.ember} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </section>

                <section className="analytics__card analytics__card--half">
                  <h3>By priority</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={summary.byPriority}
                        dataKey="count"
                        nameKey="priority"
                        innerRadius={45}
                        outerRadius={80}
                      >
                        {summary.byPriority.map((entry) => (
                          <Cell
                            key={entry.priority}
                            fill={PRIORITY_COLORS[entry.priority] || COLORS.slate}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </section>
              </div>

              <section className="analytics__card">
                <h3>By status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.byStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ded5bd" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {summary.byStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || COLORS.slate}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Analytics;