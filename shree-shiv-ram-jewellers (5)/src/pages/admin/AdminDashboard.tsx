import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ChevronRight,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Diamond
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

const data = [
  { name: 'Jan', thisMonth: 4000, lastMonth: 2400 },
  { name: 'Feb', thisMonth: 3000, lastMonth: 1398 },
  { name: 'Mar', thisMonth: 2000, lastMonth: 9800 },
  { name: 'Apr', thisMonth: 2780, lastMonth: 3908 },
  { name: 'May', thisMonth: 1890, lastMonth: 4800 },
  { name: 'Jun', thisMonth: 2390, lastMonth: 3800 },
  { name: 'Jul', thisMonth: 3490, lastMonth: 4300 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          setStats(data);
        } else {
          console.error('Failed to fetch admin stats: Invalid response');
        }
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Products', 
      value: stats?.totalProducts || '320', 
      icon: Diamond, 
      color: 'bg-gray-100 text-gray-900',
      trend: '+12%',
      isUp: true
    },
    { 
      label: 'New Orders', 
      value: stats?.pendingOrders || '12', 
      icon: ShoppingBag, 
      color: 'bg-orange-100 text-orange-600',
      trend: '+5%',
      isUp: true
    },
    { 
      label: 'Total Sales', 
      value: `₹${(stats?.totalRevenue || 450000).toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'bg-green-100 text-green-600',
      trend: '+18%',
      isUp: true
    },
    { 
      label: 'Low Stock Items', 
      value: stats?.lowStockItems || '8', 
      icon: AlertTriangle, 
      color: 'bg-yellow-100 text-yellow-600',
      trend: '-2%',
      isUp: false
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Admin!</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <button className="bg-brand-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-dark/10 hover:bg-brand-green transition-all">
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all"
          >
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <card.icon size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${card.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {card.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {card.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Overview */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Sales Overview</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-green"></div>
                <span className="text-xs font-medium text-gray-500">This Month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-cream"></div>
                <span className="text-xs font-medium text-gray-500">Last Month</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorThis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064E3B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#064E3B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="thisMonth" 
                  stroke="#064E3B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorThis)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="lastMonth" 
                  stroke="#E4E3E0" 
                  strokeWidth={3}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Monthly Sales</p>
              <p className="text-xl font-bold text-gray-900">₹2,00,000</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Orders</p>
              <p className="text-xl font-bold text-gray-900">185</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Revenue Growth</p>
              <p className="text-xl font-bold text-brand-green">+15.4%</p>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
            <button className="text-brand-green text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {(stats?.topSellingProducts || [
              { name: 'Gold Necklace Set', sales: 120, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=200' },
              { name: 'Diamond Ring', sales: 95, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200' },
              { name: 'Ruby Earrings', sales: 80, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200' },
              { name: 'Emerald Bracelet', sales: 65, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200' },
            ]).map((product: any, i: number) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-brand-cream overflow-hidden flex-shrink-0">
                  <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={10} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{product.sales}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase">Sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-brand-green text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentOrders || [
                  { id: 1024, user_name: 'Anita Sharma', status: 'shipped', total: 12000 },
                  { id: 1023, user_name: 'Rajesh Mehra', status: 'pending', total: 8500 },
                  { id: 1022, user_name: 'Priya Kapoor', status: 'delivered', total: 15000 },
                ]).map((order: any, i: number) => (
                  <tr key={i} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm font-bold text-gray-900">#ORD-{order.id}</td>
                    <td className="py-4 text-sm font-medium text-gray-600">{order.user_name}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-gray-900 text-right">₹{order.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="w-full mt-6 py-3 bg-brand-dark text-white rounded-xl text-sm font-bold hover:bg-brand-green transition-all flex items-center justify-center gap-2">
            View All Orders <ChevronRight size={16} />
          </button>
        </div>

        {/* Customer Reviews */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
            <Link to="/admin/reviews" className="text-brand-green text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {(stats?.recentReviews || [
              { user_name: 'Sonia Verma', comment: 'Beautiful necklace, loved it!', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100' },
              { user_name: 'Neha Patel', comment: 'Great quality ring!', rating: 5, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
              { user_name: 'Amit Gupta', comment: 'Fast delivery, very happy!', rating: 4, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
            ]).map((review: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                  <img src={review.avatar || `https://ui-avatars.com/api/?name=${review.user_name}`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{review.user_name}</h4>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={10} className={j < review.rating ? "fill-orange-400 text-orange-400" : "text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic line-clamp-2">"{review.comment}"</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-brand-dark text-white rounded-xl text-sm font-bold hover:bg-brand-green transition-all flex items-center justify-center gap-2">
            Manage Reviews <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
);
}
