import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { formatPrice } from '../../utils/helpers';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Card, { CardBody } from '../ui/Card';

export default function TransactionHistory({ maxItems = 10 }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [maxItems]);

  const loadTransactions = async () => {
    try {
      console.log('🔵 [TransactionHistory] Loading all transactions...');

      const q = query(
        collection(db, 'transactions'),
        orderBy('created_at', 'desc'),
        limit(maxItems)
      );

      const snapshot = await getDocs(q);
      console.log('✅ [TransactionHistory] Found', snapshot.docs.length, 'transactions');

      const txList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setTransactions(txList);
    } catch (error) {
      console.error('❌ [TransactionHistory] Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Потврђено
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Одбијено
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            На чекању
          </div>
        );
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Учитавање...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600">
        Нема трансакција за приказ
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#1A1A1A]">
        Историја Трансакција
      </h3>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.id} variant="elevated">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-[#1A1A1A]">
                      {tx.user_email || 'Непознат корисник'}
                    </span>
                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="text-sm text-gray-600">
                    {new Date(tx.created_at?.toDate?.() || tx.created_at).toLocaleString('sr-RS')}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-[#D62828]">
                    {formatPrice(tx.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {tx.id.substring(0, 8)}...
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
