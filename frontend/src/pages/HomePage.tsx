import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DateTimeFormatter from '../components/DateTimeFormatter';
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Transaction {
  _id: string;
  school_id: string;
  collect_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount: number;
  status: string;
  custom_order_id: string;
  student_name: string;
  student_id: string;
  payment_time?: string;
}

interface StatusDetails {
  status: string;
  payment_time: string;
  transaction_amount: number;
  payment_details: string;
  error_message: string;
  bank_reference: string;
}

interface ApiResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusDetails, setStatusDetails] = useState<StatusDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [schoolIdInput, setSchoolIdInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<'payment_time' | 'transaction_amount'>('payment_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInitialTransactions();
  }, [navigate]);

  const fetchInitialTransactions = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/transactions');
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSearch = async (schoolId: string): Promise<void> => {
    try {
      setLoading(true);
      setStatusDetails(null);
      const response = await api.get<ApiResponse>(`/transactions/school/${schoolId}`);
      setTransactions(response.data.data);
      setError('');
    } catch (error) {
      setError('Invalid school ID or no transactions found');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalSearch = (): void => {
    if (schoolIdInput.trim()) {
      handleSchoolSearch(schoolIdInput.trim());
    } else {
      setError('Please enter a school ID');
    }
  };

  const toggleSortDirection = (): void => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const filteredAndSortedTransactions = [...transactions]
    .filter(transaction => statusFilter === 'all' || transaction.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'payment_time') {
        const timeA = new Date(a.payment_time || 0).getTime();
        const timeB = new Date(b.payment_time || 0).getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortDirection === 'asc'
        ? a.transaction_amount - b.transaction_amount
        : b.transaction_amount - a.transaction_amount;
    });

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-6">
        {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

        {transactions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Transaction List</h2>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">/</span>
                  <input
                    type="text"
                    placeholder="Enter School ID"
                    className="px-3 py-2 border rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={schoolIdInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchoolIdInput(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleLocalSearch()}
                  />
                  <button
                    onClick={handleLocalSearch}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    Search
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="status-filter" className="text-sm text-gray-600">Status:</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleSortDirection}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Toggle sort direction"
                  >
                    {sortDirection === 'asc' ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                  
                  <select
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setSortBy(e.target.value as 'payment_time' | 'transaction_amount')
                    }
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="payment_time">Payment Time</option>
                    <option value="transaction_amount">Amount</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collect ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {transaction.collect_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.school_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{transaction.transaction_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DateTimeFormatter isoString={transaction.payment_time || ''} display='date' />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DateTimeFormatter isoString={transaction.payment_time || ''} display='time' />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {error || 'Try searching with a different school ID'}
              </p>
            </div>
          )
        )}

        {statusDetails && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Transaction Status Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Status:</p>
                <p className="font-medium">{statusDetails.status}</p>
              </div>
              <div>
                <p className="text-gray-600">Payment Time:</p>
                <p className="font-medium">
                  {new Date(statusDetails.payment_time).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Transaction Amount:</p>
                <p className="font-medium">₹{statusDetails.transaction_amount}</p>
              </div>
              <div>
                <p className="text-gray-600">Bank Reference:</p>
                <p className="font-medium">{statusDetails.bank_reference || 'N/A'}</p>
              </div>
              {statusDetails.error_message && (
                <div className="col-span-2">
                  <p className="text-gray-600">Error Message:</p>
                  <p className="text-red-500">{statusDetails.error_message}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}