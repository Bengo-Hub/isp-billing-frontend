"use client";

import { Card } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function PaymentsChart({ data }: { data?: Array<{ month: string; payments: number; expenses?: number }> }) {
  const series = data ?? months.slice(0, 10).map((m, i) => ({ month: m, payments: 2000 + i * 120, expenses: 1000 + i * 80 }));
  return (
    <Section title="Payments">
      <BarChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="payments" fill="#f472b6" name="Payments" />
        <Bar dataKey="expenses" fill="#93c5fd" name="Expenses" />
      </BarChart>
    </Section>
  );
}

export function ActiveUsersChart({ data }: { data?: Array<{ day: string; hotspot: number; pppoe: number }> }) {
  const series = data ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, hotspot: [2,3,4,3,2,1,2][i], pppoe: [1,2,1,2,1,1,1][i] }));
  return (
    <Section title="Active Users">
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hotspot" stroke="#f472b6" name="Hotspot" />
        <Line type="monotone" dataKey="pppoe" stroke="#60a5fa" name="PPPoE" />
      </LineChart>
    </Section>
  );
}

export function RetentionChart({ data }: { data?: Array<{ month: string; newC: number; returning: number; churned: number }> }) {
  const series = data ?? months.slice(4, 10).map((m, i) => ({ month: m, newC: i * 5 + 10, returning: i * 10 + 5, churned: Math.max(0, 20 - i * 3) }));
  return (
    <Section title="Customer retention rate (6 months)">
      <AreaChart data={series}>
        <defs>
          <linearGradient id="a1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="a2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="newC" name="New" stroke="#60a5fa" fill="url(#a1)" />
        <Area type="monotone" dataKey="returning" name="Returning" stroke="#f472b6" fill="url(#a2)" />
        <Line type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" />
      </AreaChart>
    </Section>
  );
}

export function DataUsageChart({ data }: { data?: Array<{ date: string; hotspot: number; pppoe: number }> }) {
  const series = data ?? Array.from({ length: 14 }).map((_, i) => ({ date: `${i+1} Oct`, hotspot: [5,6,7,6,7,8,9,8,7,6,5,5,6,6][i], pppoe: [2,2,3,3,4,6,8,9,7,6,5,4,3,3][i] }));
  return (
    <Section title="Data Usage">
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="hotspot" stroke="#f472b6" name="Hotspot" />
        <Line type="monotone" dataKey="pppoe" stroke="#60a5fa" name="PPPoE" />
      </LineChart>
    </Section>
  );
}

const PIE_COLORS = ['#f9a8d4', '#f472b6', '#fb7185', '#60a5fa', '#93c5fd', '#a78bfa'];
export function PackageUtilizationChart({ data }: { data?: Array<{ name: string; value: number }> }) {
  const series = data ?? [
    { name: '2HR SURF', value: 25 },
    { name: 'Daily', value: 20 },
    { name: 'Weekly', value: 15 },
    { name: 'Monthly', value: 30 },
    { name: 'Turbo', value: 10 },
  ];
  const total = series.reduce((a, b) => a + b.value, 0);
  return (
    <Section title="Package Utilization">
      <PieChart>
        <Tooltip />
        <Legend />
        <Pie dataKey="value" data={series} nameKey="name" innerRadius={60} outerRadius={100} label>
          {series.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </Section>
  );
}

export function RevenueForecastChart({ data }: { data?: Array<{ month: string; revenue: number; forecast?: number }> }) {
  const series = data ?? months.slice(0, 12).map((m, i) => ({ month: m, revenue: 20000 + i * 500, forecast: 21000 + i * 520 }));
  return (
    <Section title="Revenue Forecast (3 months)">
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#60a5fa" name="Historical" />
        <Line type="monotone" dataKey="forecast" stroke="#f472b6" name="Forecast" strokeDasharray="5 5" />
      </LineChart>
    </Section>
  );
}

export function SentSMSChart({ data }: { data?: Array<{ day: string; sent: number }> }) {
  const series = data ?? ['Tue','Wed','Thu','Fri','Sat','Sun','Mon'].map((d, i) => ({ day: d, sent: [1,0,0,1,0,0,1][i] }));
  return (
    <Section title="Sent SMS">
      <LineChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="sent" stroke="#60a5fa" name="Sent" />
      </LineChart>
    </Section>
  );
}

export function NetworkUsageChart({ data }: { data?: Array<{ day: string; download: number; upload: number }> }) {
  const series = data ?? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, download: [1.2,0.9,1.4,0.8,1.0,0.7,0.6][i], upload: [0.2,0.1,0.3,0.2,0.2,0.1,0.1][i] }));
  return (
    <Section title="Network Data Usage">
      <AreaChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="download" stroke="#f472b6" fill="#fbcfe8" name="Downloaded" />
        <Area type="monotone" dataKey="upload" stroke="#60a5fa" fill="#bfdbfe" name="Uploaded" />
      </AreaChart>
    </Section>
  );
}

export function RegistrationsChart({ data }: { data?: Array<{ day: string; users: number }> }) {
  const series = data ?? ['Tue','Wed','Thu','Fri','Sat','Sun','Mon'].map((d, i) => ({ day: d, users: [6,2,3,5,4,1,1][i] }));
  return (
    <Section title="User Registrations">
      <BarChart data={series}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="users" fill="#f472b6" />
      </BarChart>
    </Section>
  );
}

export function MostActiveUsersTable() {
  const rows = [
    { username: 'C299', data: '19.14GB', phone: '0724899611' },
    { username: 'C19', data: '4.56GB', phone: '0722334120' },
    { username: 'C8', data: '3.89GB', phone: '0722304089' },
    { username: 'C538', data: '1.99GB', phone: '0703914465' },
    { username: 'C536', data: '1.76GB', phone: '0723053074' },
    { username: 'C16', data: '1.66GB', phone: '0729286865' },
  ];
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">Most Active Users</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Username</th>
              <th className="py-2">Data Used</th>
              <th className="py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 font-medium text-gray-900">{r.username}</td>
                <td className="py-2">{r.data}</td>
                <td className="py-2 text-pink-600">{r.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function PackagePerformanceTable() {
  const rows = [
    { name: '2HR SURF UNLIMITED', price: 'KES 10.00', active: 132, monthlyRevenue: 'KES 905.00', avgUsage: '0.14 GB', arpu: 'KES 6.85' },
    { name: 'Daily', price: 'KES 200.00', active: 61, monthlyRevenue: 'KES 12,200.00', avgUsage: '0.35 GB', arpu: 'KES 200' },
  ];
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 mb-3">Package Performance Comparison</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Package Name</th>
              <th className="py-2">Price</th>
              <th className="py-2">Active Users</th>
              <th className="py-2">Monthly Revenue</th>
              <th className="py-2">Avg. Data Usage</th>
              <th className="py-2">ARPU</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 font-medium text-gray-900">{r.name}</td>
                <td className="py-2">{r.price}</td>
                <td className="py-2">{r.active}</td>
                <td className="py-2">{r.monthlyRevenue}</td>
                <td className="py-2">{r.avgUsage}</td>
                <td className="py-2">{r.arpu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
