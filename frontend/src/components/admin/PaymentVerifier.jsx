import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { verifyPayment } from '../../services/admin.service';
import { normalizeTransaction, sortByCreatedAtDesc } from '../../services/transactions';
import { CheckCircle, XCircle, Loader2, ExternalLink, User, BookOpen } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/helpers';
import { sendPaymentConfirmationEmail, sendPaymentRejectionEmail } from '../../services/email.service';
import { useToast } from '../ui/Toast';

export default function PaymentVerifier() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      // Get all pending transactions
      const q = query(collection(db, 'transactions'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);

      // Load additional data for each transaction
      const paymentsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const transaction = normalizeTransaction(docSnap);

          // Load user data
          let user = null;
          const userId = transaction.userId;
          if (userId) {
            const userDoc = await getDoc(doc(db, 'users', userId));
            user = userDoc.exists() ? userDoc.data() : null;
          }

          // Load course or package data based on type
          let course = null;
          let package_data = null;
          const type = transaction.type;

          if (type === 'course' && transaction.courseId) {
            const courseDoc = await getDoc(doc(db, 'courses', transaction.courseId));
            course = courseDoc.exists() ? courseDoc.data() : null;
          } else if (type === 'online_package') {
            // For online packages, create package_data from transaction fields
            package_data = {
              name: transaction.packageName || 'Online пакет',
              description: `Пакет ID: ${transaction.packageId || 'N/A'}`,
            };
          }

          return {
            ...transaction,
            user,
            course,
            package_data,
          };
        })
      );

      setPendingPayments(sortByCreatedAtDesc(paymentsData));
    } catch (error) {
      console.error('Error loading pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (payment) => {
    if (!confirm('Да ли сте сигурни да желите да потврдите ову уплату?')) {
      return;
    }

    setProcessingId(payment.id);

    try {
      // Use direct service instead of Cloud Function
      await verifyPayment(payment.id, true);

      // Send email via EmailJS (Frontend)
      if (payment.user && payment.course) {
        try {
             await sendPaymentConfirmationEmail(
                payment.user.email,
                payment.user.ime || 'Корисник',
                payment.course.title,
                payment.id
             );
             console.log('Confirmation email sent');
        } catch (emailError) {
            console.error('Failed to send confirmation email (non-critical):', emailError);
        }
      }

      // Remove the confirmed payment from the list immediately (optimistic update)
      setPendingPayments(prev => prev.filter(p => p.id !== payment.id));

      showToast({ type: 'success', message: 'Уплата успешно потврђена! Курс је активиран за корисника.' });

      // Reload payments in background to ensure consistency
      setTimeout(() => loadPendingPayments(), 1000);
    } catch (error) {
      console.error('Error confirming payment:', error);
      showToast({ type: 'error', message: 'Грешка при потврђивању уплате: ' + (error.message || 'Покушајте поново') });
      // Reload on error to restore correct state
      await loadPendingPayments();
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (payment) => {
    if (!confirm('Да ли сте сигурни да желите да одбијете ову уплату?')) {
      return;
    }

    setProcessingId(payment.id);
    const reason = prompt('Унесите разлог одбијања (опционо):');

    try {
      // Use direct service instead of Cloud Function
      await verifyPayment(payment.id, false);

       // Send email via EmailJS (Frontend)
       if (payment.user && payment.course) {
        try {
             await sendPaymentRejectionEmail(
                payment.user.email,
                payment.user.ime || 'Корисник',
                payment.course.title,
                reason || 'Невалидна уплата'
             );
             console.log('Rejection email sent');
        } catch (emailError) {
            console.error('Failed to send rejection email (non-critical):', emailError);
        }
      }

      // Remove the rejected payment from the list immediately (optimistic update)
      setPendingPayments(prev => prev.filter(p => p.id !== payment.id));

      showToast({ type: 'info', message: 'Уплата одбијена.' });

      // Reload payments in background to ensure consistency
      setTimeout(() => loadPendingPayments(), 1000);
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showToast({ type: 'error', message: 'Грешка при одбијању уплате: ' + (error.message || 'Покушајте поново') });
      // Reload on error to restore correct state
      await loadPendingPayments();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-ink">Верификација уплата</h2>
        <button
          onClick={loadPendingPayments}
          className="px-4 py-2 rounded-2xl bg-surface text-ink font-medium hover:bg-gray-200 transition-colors"
        >
          Освежи
        </button>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-gray-100">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Нема уплата на чекању</p>
          <p className="text-sm text-gray-400 mt-2">
            Све уплате су верификоване
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4 md:mb-6">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-ink mb-1">
                    {formatPrice(payment.amount)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 break-all">
                    ID: {payment.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-gold/20 text-ink px-4 py-2 rounded-full text-sm font-bold">
                    На чекању
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {payment.createdAt && formatDate(payment.createdAt)}
                  </p>
                </div>
              </div>

              {/* User & Course Info Grid */}
              <div className="grid md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
                {/* User Info */}
                <div className="bg-surface rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-brand" />
                    <h4 className="font-bold text-ink">Корисник</h4>
                  </div>
                  {payment.user ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">{payment.user.ime}</p>
                      <p className="text-gray-500 break-all">{payment.user.email}</p>
                      {payment.user.telefon && (
                        <p className="text-gray-500">{payment.user.telefon}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Непознат корисник</p>
                  )}
                </div>

                {/* Course/Package Info */}
                <div className="bg-surface rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="h-5 w-5 text-brand" />
                    <h4 className="font-bold text-ink">
                      {payment.type === 'online_package' ? 'Online Пакет' : 'Курс'}
                    </h4>
                  </div>
                  {payment.type === 'online_package' && payment.package_data ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">{payment.package_data.name}</p>
                      <p className="text-gray-500">
                        {payment.package_data.duration || payment.package_data.description}
                      </p>
                    </div>
                  ) : payment.course ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">{payment.course.title}</p>
                      <p className="text-gray-500 line-clamp-2">
                        {payment.course.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {payment.type === 'online_package' ? 'Непознат пакет' : 'Непознат курс'}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Reference */}
              <div className="bg-blue-50/50 rounded-2xl p-4 mb-4 md:mb-6">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Позив на број</p>
                    <p className="font-mono font-bold text-base sm:text-lg text-ink break-all">{payment.paymentRef}</p>
                  </div>
                  {payment.invoiceUrl && (
                    <a
                      href={payment.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Уплатница
                    </a>
                  )}
                </div>
              </div>

              {/* Confirmation Document */}
              {payment.confirmationUrl ? (
                <div className="bg-green-50 rounded-2xl p-4 mb-4 md:mb-6 border border-green-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-green-800 mb-1">✓ Потврда о уплати примљена</p>
                      <p className="text-sm text-green-600">
                        Корисник је отпремио потврду
                      </p>
                    </div>
                    <a
                      href={payment.confirmationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-50 flex items-center shadow-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Погледај потврду
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 md:mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Корисник још није отпремио потврду о уплати
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => confirmPayment(payment)}
                  disabled={processingId === payment.id}
                  className="flex-1 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {processingId === payment.id ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Потврђивање...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Потврди уплату
                    </>
                  )}
                </button>
                <button
                  onClick={() => rejectPayment(payment)}
                  disabled={processingId === payment.id}
                  className="flex-1 bg-red-100 text-red-700 px-4 sm:px-6 py-3 rounded-2xl font-bold hover:bg-red-200 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {processingId === payment.id ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Одбијање...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Одбиј уплату
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
