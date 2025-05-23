import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  usersList: IAuthUser[];
}

// Couleurs synchronisées avec UserCountSection
const ROLE_COLORS = [
  '#D7000F', // ADMIN (rouge)
  '#333333', // MANAGER (noir)
  '#B0B0B0', // USER (gris)
  '#FFD600', // IT_MANAGER (jaune)
  '#7C3AED', // RH_MANAGER (violet)
  '#FF9900', // PLANT_MANAGER (orange)
];

const BORDER_COLORS = [
  '#B8000C', // ADMIN
  '#222222', // MANAGER
  '#888888', // USER
  '#E6C200', // IT_MANAGER
  '#5B21B6', // RH_MANAGER
  '#C76A00', // PLANT_MANAGER
];

const UserChartSection = ({ usersList }: IProps) => {
  const chartLabels = [
    RolesEnum.ADMIN,
    RolesEnum.MANAGER,
    RolesEnum.USER,
    RolesEnum.IT_MANAGER,
    RolesEnum.RH_MANAGER,
    RolesEnum.PLANT_MANAGER
  ];

  const chartValues = [
    usersList.filter((q) => q.roles.includes(RolesEnum.ADMIN)).length,
    usersList.filter((q) => q.roles.includes(RolesEnum.MANAGER)).length,
    usersList.filter((q) => q.roles.includes(RolesEnum.USER)).length,
    usersList.filter((q) => q.roles.includes(RolesEnum.IT_MANAGER)).length,
    usersList.filter((q) => q.roles.includes(RolesEnum.RH_MANAGER)).length,
    usersList.filter((q) => q.roles.includes(RolesEnum.PLANT_MANAGER)).length
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#1f2937',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#1f2937',
          font: { size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#1f2937',
          font: { size: 12 }
        },
        grid: {
          color: '#e5e7eb',
          borderDash: [5, 5]
        }
      }
    }
  };

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Nombre d'utilisateurs",
        data: chartValues,
        backgroundColor: ROLE_COLORS,
        borderColor: BORDER_COLORS,
        borderWidth: 2
      }
    ]
  };

  return (
    <div className='col-span-1 lg:col-span-3 bg-white p-5 rounded-lg shadow-sm'>
      <h1 className='text-lg font-medium text-gray-900 mb-4 tracking-tight'>Répartition des utilisateurs par rôle</h1>
      <div className='bg-white p-3 rounded-lg'>
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default UserChartSection;