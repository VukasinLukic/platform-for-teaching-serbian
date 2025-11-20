import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, functions } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { CheckCircle, XCircle, Loader2, ExternalLink, User, BookOpen, Calendar } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/helpers';

export default function PaymentVerifier() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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
          const userDoc = await getDoc(doc(db, 'users', transaction.user_id));
          const user = userDoc.exists() ? userDoc.data() : null;

          // Load course data
          const courseDoc = await getDoc(doc(db, 'courses', transaction.course_id));
          const course = courseDoc.exists() ? courseDoc.data() : null;

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

  const confirmPayment = async (transactionId, userId, courseId) => {
    if (!confirm('Da li ste sigurni da želite da potvrdite ovu uplatu?')) {
      return;
    }

    setProcessingId(transactionId);

    try {
      // Call Cloud Function to confirm payment
      const confirmPaymentFn = httpsCallable(functions, 'confirmPayment');
      await confirmPaymentFn({
        transactionId,
        userId,
        courseId,
      });

      // Reload payments
      await loadPendingPayments();
      alert('Uplata uspešno potvrđena!');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Greška pri potvrđivanju uplate: ' + (error.message || 'Pokušajte ponovo'));
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (transactionId) => {
    if (!confirm('Da li ste sigurni da želite da odbijete ovu uplatu?')) {
      return;
    }

    setProcessingId(transactionId);

    try {
      const rejectPaymentFn = httpsCallable(functions, 'rejectPayment');
      await rejectPaymentFn({ transactionId });

      await loadPendingPayments();
      alert('Uplata odbijena');
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Greška pri odbijanju uplate: ' + (error.message || 'Pokušajte ponovo'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verifikacija uplata</h2>
        <button
          onClick={loadPendingPayments}
          className="btn-secondary"
        >
          Osveži
        </button>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Nema uplata na čekanju</p>
          <p className="text-sm text-muted-foreground mt-2">
            Sve uplate su verifikovane
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingPayments.map((payment) => (
            <div
              key={payment.id}
              className="glass-card rounded-2xl p-8 border-primary/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {formatPrice(payment.amount)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {payment.id}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-bold">
                    Na čekanju
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {payment.created_at && formatDate(payment.created_at)}
                  </p>
                </div>
              </div>

              {/* User & Course Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* User Info */}
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="h-5 w-5 text-primary" />
                    <h4 className="font-bold">Korisnik</h4>
                  </div>
                  {payment.user ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{payment.user.ime}</p>
                      <p className="text-muted-foreground">{payment.user.email}</p>
                      {payment.user.telefon && (
                        <p className="text-muted-foreground">{payment.user.telefon}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nepoznat korisnik</p>
                  )}
                </div>

                {/* Course Info */}
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h4 className="font-bold">Kurs</h4>
                  </div>
                  {payment.course ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">{payment.course.title}</p>
                      <p className="text-muted-foreground line-clamp-2">
                        {payment.course.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nepoznat kurs</p>
                  )}
                </div>
              </div>

              {/* Payment Reference */}
              <div className="bg-secondary/5 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Poziv na broj</p>
                    <p className="font-mono font-bold text-lg">{payment.payment_ref}</p>
                  </div>
                  {payment.invoice_url && (
                    <a
                      href={payment.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Uplatnica
                    </a>
                  )}
                </div>
              </div>

              {/* Confirmation Document */}
              {payment.confirmation_url ? (
                <div className="bg-primary/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-1">✓ Potvrda o uplati primljena</p>
                      <p className="text-sm text-muted-foreground">
                        Korisnik je upload-ovao potvrdu
                      </p>
                    </div>
                    <a
                      href={payment.confirmation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary py-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Pogledaj potvrdu
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Korisnik još nije upload-ovao potvrdu o uplati
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => confirmPayment(payment.id, payment.user_id, payment.course_id)}
                  disabled={processingId === payment.id}
                  className="btn-primary flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId === payment.id ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Potvrđivanje...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Potvrdi uplatu
                    </>
                  )}
                </button>
                <button
                  onClick={() => rejectPayment(payment.id)}
                  disabled={processingId === payment.id}
                  className="btn-secondary flex-1 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-50"
                >
                  {processingId === payment.id ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Odbijanje...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Odbij uplatu
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
