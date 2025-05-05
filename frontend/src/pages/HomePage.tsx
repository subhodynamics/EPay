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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modal States
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Form Inputs
  const [customRequestId, setCustomRequestId] = useState<string>('');
  const [paymentFormData, setPaymentFormData] = useState({
    school_id: '',
    amount: '',
    name: '',
    student_id: '',
    email: ''
  });

  // API Response for Status Check
  const [statusCheckResult, setStatusCheckResult] = useState<StatusDetails | null>(null);

  const navigate = useNavigate();

  // Fetch initial transactions on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInitialTransactions();
  }, [navigate]);

  const fetchInitialTransactions = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>('/transactions', {
        params: { page, limit: 10 }
      });
      setTransactions(response.data.data);
      setCurrentPage(response.data.meta.page);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolSearch = async (schoolId: string, page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      setStatusDetails(null);
      const response = await api.get<ApiResponse>(`/transactions/school/${schoolId}`, {
        params: { page, limit: 10 }
      });
      setTransactions(response.data.data);
      setCurrentPage(response.data.meta.page);
      setTotalPages(response.data.meta.totalPages);
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
      handleSchoolSearch(schoolIdInput.trim(), 1);
    } else {
      setError('Please enter a school ID');
    }
  };

  const toggleSortDirection = (): void => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handlePreviousPage = (): void => {
    const newPage = currentPage - 1;
    if (newPage < 1) return;
    if (schoolIdInput.trim()) {
      handleSchoolSearch(schoolIdInput.trim(), newPage);
    } else {
      fetchInitialTransactions(newPage);
    }
  };

  const handleNextPage = (): void => {
    const newPage = currentPage + 1;
    if (newPage > totalPages) return;
    if (schoolIdInput.trim()) {
      handleSchoolSearch(schoolIdInput.trim(), newPage);
    } else {
      fetchInitialTransactions(newPage);
    }
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

  // Inside your Home function component...

const handleStatusCheck = async () => {
  if (!customRequestId.trim()) {
    alert('Please enter a Custom Request ID');
    return;
    }

    try {
        setLoading(true);

        const token = localStorage.getItem('token');
        const response = await api.get(`/transactions/status/${customRequestId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setStatusCheckResult(response.data as StatusDetails);
    } catch (err: any) {
        console.error('Status check failed:', err);
        alert(`Failed to fetch status: ${err.message}`);
    } finally {
        setLoading(false);
    }
};

const handleMakePayment = async () => {
    const { school_id, amount, name, student_id, email } = paymentFormData;

    if (!school_id || !amount || !name || !student_id || !email) {
        alert('All fields are required');
        return;
    }

    try {
        setLoading(true);

        const token = localStorage.getItem('token');

        const payload = {
            school_id,
            amount,
            callback_url: 'https://epay.subhadeep.in/home',
            student_info: {
                name,
                id: student_id,
                email,
            },
        };

        const response = await api.post<{ collect_request_url?: string }>('/payments/create-payment', payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data?.collect_request_url) {
            window.location.href = response.data.collect_request_url;
        } else {
            alert('No payment URL received');
        }
    } catch (err: any) {
        console.error('Payment creation failed:', err);
        alert(`Failed to create payment: ${err.message}`);
    } finally {
        setLoading(false);
    }
};

  // Reset form when closing modals
  useEffect(() => {
    if (!isStatusModalOpen) {
      setCustomRequestId('');
      setStatusCheckResult(null);
    }
  }, [isStatusModalOpen]);

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setPaymentFormData({
        school_id: '',
        amount: '',
        name: '',
        student_id: '',
        email: ''
      });
    }
  }, [isPaymentModalOpen]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="px-4 py-6">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>
        )}
        {transactions.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Transaction List</h2>
                <span className="text-gray-400">/</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter School ID"
                    value={schoolIdInput}
                    onChange={(e) => setSchoolIdInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLocalSearch()}
                    className="px-3 py-2 border rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  <label htmlFor="status-filter" className="text-sm text-gray-600">
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    onChange={(e) =>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collect ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Custom order ID
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collect ID
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.collect_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.custom_order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.school_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{transaction.transaction_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DateTimeFormatter isoString={transaction.payment_time || ''} display="date" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <DateTimeFormatter isoString={transaction.payment_time || ''} display="time" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center p-4 border-t">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * 10, filteredAndSortedTransactions.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {filteredAndSortedTransactions.length}
                    </span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      {'<'}
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      {'>'}
                    </button>
                  </nav>
                </div>
              </div>
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

        {/* Status Details Section */}
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

        {/* Buttons for Modals */}
        <div className="flex justify-end p-4">
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Status Check
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ml-2"
          >
            Make Payment
          </button>
        </div>

        {/* Status Check Modal */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Status Check</h3>
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom order ID
                </label>
                <input
                  type="text"
                  value={customRequestId}
                  onChange={(e) => setCustomRequestId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleStatusCheck}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Check Status
                </button>
              </div>
              {statusCheckResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(statusCheckResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Make Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Make Payment</h3>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
                  <input
                    type="text"
                    value={paymentFormData.school_id}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, school_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={paymentFormData.amount}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={paymentFormData.name}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={paymentFormData.student_id}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, student_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={paymentFormData.email}
                    onChange={(e) =>
                      setPaymentFormData({ ...paymentFormData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleMakePayment}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}