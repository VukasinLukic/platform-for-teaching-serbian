import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, FileText, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserCourses } from '../services/course.service';
import { getUserTransactions } from '../services/payment.service';
import { formatPrice, formatDate, getTransactionStatusLabel, getTransactionStatusColor } from '../utils/helpers';
import PaymentConfirmationUpload from '../components/payment/PaymentConfirmationUpload';
import Header from '../components/ui/Header';
import Card, { CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function DashboardPage() {
  const { user, userProfile } = useAuthStore();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#BFECC9] border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Učitavanje vašeg dashboard-a...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#003366] to-[#004488] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">
                Dobrodošli, {userProfile?.ime || user.displayName || 'Učeniče'}!
              </h1>
              <p className="text-[#BFECC9] text-lg">Vaš put ka uspehu na maloj maturi</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-[#BFECC9] p-3 rounded-xl">
                    <Book className="w-6 h-6 text-[#003366]" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{myCourses.length}</div>
                    <div className="text-sm text-white/80">Aktivnih kurseva</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* My Courses Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#003366]">Moji kursevi</h2>
            <Link to="/#kursevi">
              <Button variant="outline" size="sm" showArrow>
                Pregledaj sve kurseve
              </Button>
            </Link>
          </div>

          {myCourses.length === 0 ? (
            <Card variant="elevated">
              <CardBody className="p-12 text-center">
                <div className="bg-[#BFECC9]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Book className="h-12 w-12 text-[#003366]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#003366]">Još uvek nemate kupljene kurseve</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Počnite svoje putovanje ka uspehu na maloj maturi sa našim kursevima!
                </p>
                <Link to="/#kursevi">
                  <Button variant="primary" size="lg" showArrow>
                    Pregledaj dostupne kurseve
                  </Button>
                </Link>
              </CardBody>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <Link key={course.id} to={`/course/${course.id}`}>
                  <Card variant="elevated" hover className="h-full">
                    <div className="h-48 bg-gradient-to-br from-[#BFECC9]/30 to-[#FFD700]/30 flex items-center justify-center relative overflow-hidden">
                      <Book className="h-20 w-20 text-[#003366] opacity-40" />
                      <div className="absolute top-4 right-4 bg-[#BFECC9] px-3 py-1 rounded-full text-xs font-bold text-[#003366]">
                        Aktivan
                      </div>
                    </div>
                    <CardBody className="p-6">
                      <h3 className="font-bold text-xl text-[#003366] mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="pt-4 border-t-2 border-gray-100">
                        <p className="text-xs text-gray-500">
                          Kupljeno: {formatDate(course.purchased_at)}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Transactions Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif font-bold text-[#003366]">Moje uplate</h2>
          </div>

          {transactions.length === 0 ? (
            <Card variant="elevated">
              <CardBody className="p-12 text-center">
                <div className="bg-[#42A5F5]/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-12 w-12 text-[#42A5F5]" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[#003366]">Nemate zabeleženih uplata</h3>
                <p className="text-gray-600">Vaše transakcije će se pojaviti ovde nakon kupovine kursa.</p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const statusColors = {
                  confirmed: 'bg-green-50 border-green-200 text-green-700',
                  pending: 'bg-blue-50 border-blue-200 text-blue-700',
                  rejected: 'bg-red-50 border-red-200 text-red-700',
                };

                return (
                  <Card key={transaction.id} variant="elevated">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                        <div>
                          <p className="font-bold text-2xl text-[#003366]">{formatPrice(transaction.amount)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {transaction.created_at && formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                            statusColors[transaction.status] || statusColors.pending
                          }`}
                        >
                          {getStatusIcon(transaction.status)}
                          {getTransactionStatusLabel(transaction.status)}
                        </div>
                      </div>

                      {/* Transaction Actions */}
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
                        {transaction.invoice_url && (
                          <a
                            href={transaction.invoice_url}
                            download
                            className="text-[#003366] hover:text-[#FF6B35] text-sm font-semibold transition inline-flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Preuzmi uplatnicu
                          </a>
                        )}
                      </div>

                      {/* Upload Component for Pending Transactions */}
                      {transaction.status === 'pending' && !transaction.confirmation_url && (
                        <div className="mt-6 pt-6 border-t-2 border-gray-100">
                          <PaymentConfirmationUpload
                            transactionId={transaction.id}
                            onSuccess={loadUserData}
                          />
                        </div>
                      )}

                      {/* Confirmation Uploaded Message */}
                      {transaction.confirmation_url && transaction.status === 'pending' && (
                        <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                          <p className="text-sm text-blue-700 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Potvrda o uplati je primljena. Čekamo verifikaciju od strane admina.
                          </p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A28] py-16 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-serif font-bold mb-4">Spremni za uspeh?</h2>
          <p className="text-xl mb-8 text-white/90">
            Započnite pripremu sa profesorkom Marinom Lukić i osvojite željenu srednju školu!
          </p>
          <Link to="/#kursevi">
            <Button variant="outlineWhite" size="xl" showArrow>
              Pogledaj sve kurseve
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
