import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { verifyPayment } from '../../services/admin.service';
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
          const transaction = docSnap.data();

          // Load user data
          let user = null;
          if (transaction.user_id) {
            const userDoc = await getDoc(doc(db, 'users', transaction.user_id));
            user = userDoc.exists() ? userDoc.data() : null;
          }

          // Load course data
          let course = null;
          if (transaction.course_id) {
            const courseDoc = await getDoc(doc(db, 'courses', transaction.course_id));
            course = courseDoc.exists() ? courseDoc.data() : null;
          }

          return {
            id: docSnap.id,
            ...transaction,
            user,
            course,
          };
        })
      );

      setPendingPayments(paymentsData);
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
        <Loader2 className="h-8 w-8 animate-spin text-[#D62828]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Верификација уплата</h2>
        <button
          onClick={loadPendingPayments}
          className="px-4 py-2 rounded-2xl bg-[#F7F7F7] text-[#1A1A1A] font-medium hover:bg-gray-200 transition-colors"
        >
          Освежи
        </button>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
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
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">
                    {formatPrice(payment.amount)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {payment.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-[#F2C94C]/20 text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-bold">
                    На чекању
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {payment.created_at && formatDate(payment.created_at)}
                  </p>
                </div>
              </div>

              {/* User & Course Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* User Info */}
                <div className="bg-[#F7F7F7] rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-[#D62828]" />
                    <h4 className="font-bold text-[#1A1A1A]">Корисник</h4>
                  </div>
                  {payment.user ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">{payment.user.ime}</p>
                      <p className="text-gray-500">{payment.user.email}</p>
                      {payment.user.telefon && (
                        <p className="text-gray-500">{payment.user.telefon}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Непознат корисник</p>
                  )}
                </div>

                {/* Course Info */}
                <div className="bg-[#F7F7F7] rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="h-5 w-5 text-[#D62828]" />
                    <h4 className="font-bold text-[#1A1A1A]">Курс</h4>
                  </div>
                  {payment.course ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-semibold">{payment.course.title}</p>
                      <p className="text-gray-500 line-clamp-2">
                        {payment.course.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Непознат курс</p>
                  )}
                </div>
              </div>

              {/* Payment Reference */}
              <div className="bg-blue-50/50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Позив на број</p>
                    <p className="font-mono font-bold text-lg text-[#1A1A1A]">{payment.payment_ref}</p>
                  </div>
                  {payment.invoice_url && (
                    <a
                      href={payment.invoice_url}
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
              {payment.confirmationUrl || payment.confirmation_url ? (
                <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800 mb-1">✓ Потврда о уплати примљена</p>
                      <p className="text-sm text-green-600">
                        Корисник је отпремио потврду
                      </p>
                    </div>
                    <a
                      href={payment.confirmationUrl || payment.confirmation_url}
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Корисник још није отпремио потврду о уплати
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => confirmPayment(payment)}
                  disabled={processingId === payment.id}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
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
                  className="flex-1 bg-red-100 text-red-700 px-6 py-3 rounded-2xl font-bold hover:bg-red-200 disabled:opacity-50 flex items-center justify-center transition-colors"
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
