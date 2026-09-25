import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { normalizeTransaction, sortByCreatedAtDesc } from '../../services/transactions';
import { formatPrice } from '../../utils/helpers';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Mail } from 'lucide-react';

export default function TransactionHistory({ itemsPerPage = 10 }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allTransactions, setAllTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      console.log('🔵 [TransactionHistory] Loading all transactions...');

      // No server-side orderBy: legacy docs without `created_at` would be dropped.
      // Normalize and sort client-side instead.
      const snapshot = await getDocs(collection(db, 'transactions'));
      console.log('✅ [TransactionHistory] Found', snapshot.docs.length, 'transactions');

      // Učitaj podatke korisnika za svaku transakciju
      const txList = await Promise.all(
        snapshot.docs.map(async (txDoc) => {
          const txData = normalizeTransaction(txDoc);

          // Dohvati podatke korisnika iz users kolekcije
          if (txData.userId) {
            const userId = txData.userId;
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                txData.userName = userData.ime || 'Непознато име';
                txData.userEmail = userData.email || txData.userEmail || 'Непознат емаил';
                txData.userPhone = userData.telefon || '';
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }

          return txData;
        })
      );

      const sorted = sortByCreatedAtDesc(txList);
      setAllTransactions(sorted);
      setTotalPages(Math.ceil(sorted.length / itemsPerPage));
      updatePage(1, sorted);
    } catch (error) {
      console.error('❌ [TransactionHistory] Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePage = (page, txList = allTransactions) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setTransactions(txList.slice(startIndex, endIndex));
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updatePage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updatePage(currentPage + 1);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Потврђено
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Одбијено
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            На чекању
          </div>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  if (allTransactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="font-medium">Нема трансакција за приказ</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl md:text-2xl font-bold text-ink">
          Историја Трансакција
        </h3>
        <div className="text-sm text-gray-600">
          Укупно: <span className="font-bold text-ink">{allTransactions.length}</span> трансакција
        </div>
      </div>

      {/* Mobile: card list (below md) */}
      <ul className="md:hidden space-y-3" aria-label="Трансакције">
        {transactions.map((tx) => (
          <li key={tx.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {tx.userName?.charAt(0) || tx.userEmail?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink truncate">{tx.userName || 'Непознато име'}</div>
                <div className="text-sm text-gray-600 truncate">{tx.userEmail || 'Непознат емаил'}</div>
                {tx.userPhone && <div className="text-xs text-gray-500 mt-0.5">{tx.userPhone}</div>}
              </div>
              <div className="font-bold text-brand text-base whitespace-nowrap">{formatPrice(tx.amount)}</div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              {getStatusBadge(tx.status)}
              <span className="text-xs text-gray-500">
                {new Date(tx.created_at?.toDate?.() || tx.created_at).toLocaleString('sr-RS')}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-400 font-mono">ID: {tx.id.substring(0, 8)}…</div>
          </li>
        ))}
      </ul>

      {/* Table (md and up) */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Корисник</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Износ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Датум</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {tx.userName?.charAt(0) || tx.userEmail?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink truncate">
                          {tx.userName || 'Непознато име'}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-1 truncate">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          {tx.userEmail || 'Непознат емаил'}
                        </div>
                        {tx.userPhone && (
                          <div className="text-xs text-gray-500 mt-0.5">{tx.userPhone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(tx.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand text-lg">
                      {formatPrice(tx.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {tx.createdAt ? tx.createdAt.toLocaleString('sr-RS') : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 font-mono">
                      {tx.id.substring(0, 8)}...
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Страна {currentPage} од {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Претходна
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              Следећа
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
