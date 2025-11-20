import { useState } from 'react';
import { generateInvoice } from '../../services/payment.service';
import { Download, CheckCircle, Loader2, FileText, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

export default function InvoiceGenerator({ courseId, courseName, price }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await generateInvoice(courseId);
      setInvoiceData(data);
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err.message || 'Greška pri generisanju uplatnice. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  if (invoiceData) {
    return (
      <div className="glass-card rounded-3xl p-8 border-primary/40">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Uplatnica generisana!</h3>
          <p className="text-muted-foreground">
            Vaša uplatnica je spremna za preuzimanje
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-muted/30 rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Poziv na broj:</span>
            <span className="font-mono font-bold text-lg text-primary">
              {invoiceData.paymentRef}
            </span>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Iznos:</span>
              <span className="text-2xl font-black text-gradient">
                {formatPrice(invoiceData.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <a
          href={invoiceData.invoiceUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full mb-6 group"
        >
          <Download className="h-5 w-5 mr-2" />
          Preuzmi uplatnicu (PDF)
          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* Instructions */}
        <div className="bg-secondary/5 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-secondary" />
            Sledeći koraci:
          </h4>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start">
              <span className="bg-primary text-black font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                1
              </span>
              <span className="text-muted-foreground">
                Preuzmite PDF uplatnicu klikom na dugme iznad
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-black font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                2
              </span>
              <span className="text-muted-foreground">
                Izvršite uplatu u banci ili putem e-banking aplikacije
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-black font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                3
              </span>
              <span className="text-muted-foreground">
                Upload-ujte potvrdu o uplati u svom Dashboard-u
              </span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-black font-bold w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                4
              </span>
              <span className="text-muted-foreground">
                Čekajte potvrdu (obično do 24h) i pristup kursu
              </span>
            </li>
          </ol>
        </div>

        {/* Support note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Imate pitanja? Kontaktirajte nas na{' '}
          <a href="mailto:profesor@onlinesrpski.com" className="text-primary hover:underline">
            profesor@onlinesrpski.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Kupovina kursa</h3>
        <p className="text-muted-foreground">{courseName}</p>
      </div>

      {/* Price Display */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 mb-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">Cena kursa</div>
        <div className="text-5xl font-black text-gradient mb-2">
          {formatPrice(price)}
        </div>
        <div className="text-sm text-muted-foreground">Jednokratna uplata</div>
      </div>

      {/* What's included */}
      <div className="mb-6">
        <h4 className="font-bold mb-4">Šta dobijate:</h4>
        <ul className="space-y-3">
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
            <span className="text-muted-foreground">Doživotni pristup svim lekcijama</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
            <span className="text-muted-foreground">Video materijali u HD kvalitetu</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
            <span className="text-muted-foreground">Dodatni materijali za preuzimanje</span>
          </li>
          <li className="flex items-center">
            <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
            <span className="text-muted-foreground">Podrška i pomoć profesorke</span>
          </li>
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generisanje...
          </>
        ) : (
          <>
            <FileText className="h-5 w-5 mr-2" />
            Generiši uplatnicu
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Info note */}
      <p className="text-center text-xs text-muted-foreground mt-4">
        Uplata se vrši putem bankovne uplatnice. Nakon uplate, upload-ujte potvrdu za pristup.
      </p>
    </div>
  );
}
