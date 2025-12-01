
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'warning' | 'danger' | 'success';
}

const colorClasses = {
    primary: 'border-primary',
    warning: 'border-warning',
    danger: 'border-danger',
    success: 'border-success',
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-8 ${colorClasses[color]} flex items-center justify-between transition-transform transform hover:-translate-y-1 hover:shadow-2xl`}>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className="text-4xl font-bold text-gray-800 dark:text-white">{value}</p>
      </div>
      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
        {icon}
      </div>
    </div>
  );
};

export default MetricCard;
