import { IAuthUser, RolesEnum } from '../../../types/auth.types';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IProps {
  usersList: IAuthUser[];
}

// Couleurs synchronisées avec UserCountSection
const ROLE_COLORS = [
  '#ED1C24', // ADMIN (rouge yazaki)
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
          font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#ED1C24',
        bodyColor: '#1f2937',
        borderColor: '#ED1C24',
        borderWidth: 1,
        titleFont: { size: 14, weight: 'bold', family: 'Inter, sans-serif' },
        bodyFont: { size: 13, family: 'Inter, sans-serif' },
        padding: 12
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#1f2937',
          font: { size: 13, weight: 'bold', family: 'Inter, sans-serif' },
          padding: 8,
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#1f2937',
          font: { size: 13, weight: 'bold', family: 'Inter, sans-serif' },
          padding: 8,
        },
        grid: {
          color: '#e5e7eb',
          borderDash: [5, 5]
        }
      }
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart',
    },
    elements: {
      bar: {
        borderRadius: 12,
        hoverBackgroundColor: '#ED1C24',
        hoverBorderColor: '#ED1C24',
        borderSkipped: false,
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
    <div className='col-span-1 lg:col-span-3 bg-gray-50 p-6 rounded-3xl shadow-lg'>
      <h1 className='text-2xl font-extrabold text-yazaki-red mb-6 tracking-tight'>User distribution by role</h1>
      <div className='bg-white p-5 rounded-2xl shadow flex items-center justify-center min-h-[340px]'>
        <Bar options={chartOptions} data={chartData} />
      </div>
    </div>
  );
};

export default UserChartSection;