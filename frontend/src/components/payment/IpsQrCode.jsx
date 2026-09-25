import { useEffect, useState } from 'react';
import { Download, QrCode } from 'lucide-react';

/**
 * Renders an NBS IPS QR payload as an image (client-side, `qrcode` library loaded on demand).
 */
export default function IpsQrCode({ payload, fileName = 'ips-qr', size = 240 }) {
  const [dataUrl, setDataUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl('');
    setFailed(false);
    if (!payload) return undefined;

    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(payload, {
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 480,
          color: { dark: '#000000', light: '#FFFFFF' },
        })
      )
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR generation failed:', err);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (!payload || failed) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4"
        style={{ width: size, height: size }}
      >
        <QrCode className="w-10 h-10 text-gray-300 mb-2" aria-hidden="true" />
        <p className="text-xs text-gray-500">QR код тренутно није доступан. Користи податке за уплату испод.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm" style={{ width: size + 18, height: size + 18 }}>
        {dataUrl ? (
          <img
            src={dataUrl}
            width={size}
            height={size}
            alt="IPS QR код за уплату — скенирај у апликацији своје банке"
            className="block"
            style={{ width: size, height: size, imageRendering: 'pixelated' }}
          />
        ) : (
          <div className="animate-pulse bg-gray-100 rounded-xl" style={{ width: size, height: size }} />
        )}
      </div>
      {dataUrl && (
        <a
          href={dataUrl}
          download={`${fileName}.png`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D62828] hover:underline"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Сачувај QR код као слику
        </a>
      )}
    </div>
  );
}
