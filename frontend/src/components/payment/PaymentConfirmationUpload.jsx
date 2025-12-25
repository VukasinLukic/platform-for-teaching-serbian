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
      setError('Дозвољен формат: JPEG, PNG, WebP или PDF');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Фајл је превелик. Максимална величина је 5MB');
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
      setError('Молимо одаберите фајл');
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
      setError(err.message || 'Грешка при отпремању. Покушајте поново.');
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-[#1A1A1A]">Потврда послата!</h3>
        <p className="text-gray-600 mb-4">
          Ваша потврда о уплати је успешно примљена. Верификација траје до 24 сата.
        </p>
        <div className="bg-[#F7F7F7] rounded-2xl p-4">
          <p className="text-sm text-gray-600">
            Добићете имејл када администратор потврди вашу уплату и омогући приступ курсу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-2 text-[#1A1A1A]">Пошаљите потврду о уплати</h3>
      <p className="text-gray-600 mb-6">
        Пренесите фотографију или PDF извода банковне уплатнице
      </p>

      {/* File Input Area */}
      <div className="mb-6">
        {!file ? (
          <label className="block">
            <div className="border-2 border-dashed border-gray-200 hover:border-[#D62828] rounded-2xl p-8 text-center cursor-pointer transition-colors group">
              <div className="bg-[#D62828]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D62828]/20 transition-colors">
                <Upload className="h-8 w-8 text-[#D62828]" />
              </div>
              <p className="font-semibold mb-2 text-[#1A1A1A] group-hover:text-[#D62828] transition-colors">
                Кликните за отпремање
              </p>
              <p className="text-sm text-gray-600">
                или превуците фајл овде
              </p>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, WebP или PDF (макс 5MB)
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
          <div className="border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="bg-[#D62828]/10 w-20 h-20 rounded-xl flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-[#D62828]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-[#1A1A1A]">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 hover:bg-[#F7F7F7] rounded-lg transition-colors"
                disabled={uploading}
              >
                <X className="h-5 w-5 text-gray-600" />
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
        className="w-full bg-[#D62828] text-white py-3 px-6 rounded-2xl font-bold hover:bg-[#B91F1F] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Отпремање у току...
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-2" />
            Пошаљи потврду
          </>
        )}
      </button>

      {/* Info note */}
      <div className="bg-[#F7F7F7] rounded-2xl p-4 mt-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Савет:</strong> Уверите се да су сви детаљи уплатнице јасно видљиви
          на фотографији или PDF-у.
        </p>
      </div>
    </div>
  );
}
