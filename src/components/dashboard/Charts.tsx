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
    <Card className="p-3 sm:p-4">
      <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">{title}</div>
      <div className="h-48 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as any}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function PaymentsChart({ data }: { data?: Array<{ month: string; payments: number; expenses?: number }> }) {
  const series = data ?? [];
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
  const series = data ?? [];
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
  const series = data ?? [];
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
  const series = data ?? [];
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
  const series = data ?? [];
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

export function RevenueForecastChart({ data }: { data?: Array<{ month: string; revenue?: number; forecast?: number }> }) {
  const series = data ?? [];
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
  const series = data ?? [];
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
  const series = data ?? [];
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
  const series = data ?? [];
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

export function MostActiveUsersTable({ data }: { data?: Array<{ username: string; data: string; phone: string }> }) {
  const rows = data ?? [];
  return (
    <Card className="p-3 sm:p-4">
      <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Most Active Users</div>
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No active users found</p>
        ) : (
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-3">Username</th>
                <th className="py-2 pr-3">Data Used</th>
                <th className="py-2 hidden sm:table-cell">Phone</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 pr-3 font-medium text-gray-900">{r.username}</td>
                  <td className="py-2 pr-3">{r.data}</td>
                  <td className="py-2 text-brand-600 hidden sm:table-cell">{r.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

export function PackagePerformanceTable({ data }: { data?: Array<{ name: string; price: string; active: number; monthlyRevenue: string; avgUsage: string; arpu: string }> }) {
  const rows = data ?? [];
  return (
    <Card className="p-3 sm:p-4">
      <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Package Performance Comparison</div>
      <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">No package data available</p>
        ) : (
          <table className="w-full text-xs sm:text-sm min-w-125">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-3">Package</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Active</th>
                <th className="py-2 pr-3">Revenue</th>
                <th className="py-2 pr-3 hidden md:table-cell">Avg. Usage</th>
                <th className="py-2 hidden md:table-cell">ARPU</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 pr-3 font-medium text-gray-900">{r.name}</td>
                  <td className="py-2 pr-3">{r.price}</td>
                  <td className="py-2 pr-3">{r.active}</td>
                  <td className="py-2 pr-3">{r.monthlyRevenue}</td>
                  <td className="py-2 pr-3 hidden md:table-cell">{r.avgUsage}</td>
                  <td className="py-2 hidden md:table-cell">{r.arpu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
