import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface IProps {
  usersList: IAuthUser[];
}

const UserChartSection = ({ usersList }: IProps) => {
  const chartLabels = [RolesEnum.ADMIN, RolesEnum.MANAGER, RolesEnum.USER];
  const chartValues = [];

  const adminsCount = usersList.filter((q) => q.roles.includes(RolesEnum.ADMIN)).length;
  chartValues.push(adminsCount);

  const managersCount = usersList.filter((q) => q.roles.includes(RolesEnum.MANAGER)).length;
  chartValues.push(managersCount);

  const usersCount = usersList.filter((q) => q.roles.includes(RolesEnum.USER)).length;
  chartValues.push(usersCount);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#1f2937',
          font: { size: 12 },
        },
      },
      y: {
        ticks: {
          stepSize: 5,
          color: '#1f2937',
          font: { size: 12 },
        },
        grid: {
          color: '#e5e7eb',
          borderDash: [5, 5],
        },
      },
    },
  };

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'User Count',
        data: chartValues,
        borderColor: '#ff0000',
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
        pointBackgroundColor: '#ff0000',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#ff0000',
        pointHoverBorderColor: '#fff',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className='col-span-1 lg:col-span-3 bg-white p-5 rounded-lg shadow-sm'>
      <h1 className='text-lg font-medium text-gray-900 mb-4 tracking-tight'>Users Chart</h1>
      <div className='bg-white p-3 rounded-lg'>
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default UserChartSection;