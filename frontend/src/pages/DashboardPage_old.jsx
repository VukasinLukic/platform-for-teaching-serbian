import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserCourses } from '../services/course.service';
import { getUserTransactions } from '../services/payment.service';
import { formatPrice, formatDate, getTransactionStatusLabel, getTransactionStatusColor } from '../utils/helpers';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';

export default function DashboardPage() {
  const { user, userProfile, logout } = useAuthStore();
  const [myCourses, setMyCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [coursesData, transactionsData] = await Promise.all([
        getUserCourses(user.uid),
        getUserTransactions(user.uid),
      ]);
      setMyCourses(coursesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Book className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold text-secondary">Nauči Srpski</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Zdravo, {userProfile?.ime || user.displayName}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-700 hover:text-secondary transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Odjavi se</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-secondary mb-8">Moj Dashboard</h1>

        {/* My Courses Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Moji kursevi</h2>

          {myCourses.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Još uvek nemate kupljene kurseve.</p>
              <Link
                to="/"
                className="inline-block bg-primary hover:bg-opacity-90 text-secondary px-6 py-2 rounded-lg font-semibold transition"
              >
                Pregledaj kurseve
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition"
                >
                  <h3 className="font-bold text-lg text-secondary mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  <p className="text-xs text-gray-500">
                    Kupljeno: {formatDate(course.purchased_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Transactions Section */}
        <section>
          <h2 className="text-2xl font-semibold text-secondary mb-4">Moje uplate</h2>

          {transactions.length === 0 ? (
            <div className="bg-white p-8 rounded-lg text-center">
              <p className="text-gray-600">Nemate zabeleženih uplata.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">{formatPrice(transaction.amount)}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.created_at && formatDate(transaction.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTransactionStatusColor(transaction.status)}`}>
                      {getTransactionStatusLabel(transaction.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {transaction.invoice_url && (
                      <a
                        href={transaction.invoice_url}
                        download
                        className="text-secondary hover:underline text-sm font-semibold"
                      >
                        Preuzmi uplatnicu
                      </a>
                    )}
                  </div>

                  {/* Show upload component for pending transactions without confirmation */}
                  {transaction.status === 'pending' && !transaction.confirmation_url && (
                    <div className="mt-6">
                      <PaymentConfirmationUpload
                        transactionId={transaction.id}
                        onSuccess={loadUserData}
                      />
                    </div>
                  )}

                  {/* Show message if confirmation is uploaded */}
                  {transaction.confirmation_url && transaction.status === 'pending' && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        ✓ Potvrda o uplati je primljena. Čekamo verifikaciju od strane admina.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
