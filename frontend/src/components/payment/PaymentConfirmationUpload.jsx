import { useState } from 'react';
import { uploadPaymentConfirmation } from '../../services/payment.service';
import { Upload, CheckCircle, Loader2, FileImage, X, AlertCircle } from 'lucide-react';

export default function PaymentConfirmationUpload({ transactionId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError(null);

    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Dozvoljen format: JPEG, PNG, WebP ili PDF');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Fajl je prevelik. Maksimalna veličina je 5MB');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Molimo odaberite fajl');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadPaymentConfirmation(transactionId, file);
      setSuccess(true);

      // Call success callback after short delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      console.error('Error uploading confirmation:', err);
      setError(err.message || 'Greška pri upload-u. Pokušajte ponovo.');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="bg-primary/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Potvrda poslata!</h3>
        <p className="text-muted-foreground mb-4">
          Vaša potvrda o uplati je uspešno primljena. Verifikacija traje do 24h.
        </p>
        <div className="bg-secondary/5 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Dobićete email kada admin potvrdi vašu uplatu i omogući pristup kursu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8">
      <h3 className="text-xl font-bold mb-2">Upload potvrde o uplati</h3>
      <p className="text-muted-foreground mb-6">
        Prenesite fotografiju ili PDF izvoda bankovne uplatnice
      </p>

      {/* File Input Area */}
      <div className="mb-6">
        {!file ? (
          <label className="block">
            <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="font-semibold mb-2 group-hover:text-primary transition-colors">
                Kliknite za upload
              </p>
              <p className="text-sm text-muted-foreground">
                ili prevucite fajl ovde
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG, WebP ili PDF (maks 5MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="bg-primary/10 w-20 h-20 rounded-xl flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Upload u toku...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-2" />
            Pošalji potvrdu
          </>
        )}
      </button>

      {/* Info note */}
      <div className="bg-secondary/5 rounded-xl p-4 mt-4">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Savet:</strong> Uverite se da su svi detalji uplatnice jasno vidljivi
          na fotografiji ili PDF-u.
        </p>
      </div>
    </div>
  );
}
