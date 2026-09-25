import { forwardRef } from 'react';

/**
 * Pixel-accurate drawing of the Serbian payment slip ("налог за уплату"), used on
 * desktop and for print / PNG download.
 */
const DrawnPaymentSlip = forwardRef(function DrawnPaymentSlip(
  { userName, purposeText, recipient, paymentCode, formattedAmount, accountDisplay, model, paymentReference },
  ref
) {
  return (
    <div
      ref={ref}
      data-uplatnica
      className="mx-auto bg-white"
      style={{
        width: '780px',
        minWidth: '780px',
        height: '356px',
        border: '1px solid #999',
        fontFamily: 'Arial, Verdana, sans-serif',
        fontSize: '12px',
        position: 'relative',
      }}
    >
      {/* ===== LEFT SIDE (uplatilac, svrha, primalac) ===== */}
      <div
        style={{
          float: 'left',
          width: '370px',
          height: '227px',
          marginTop: '34px',
          marginLeft: '19px',
          borderRight: '1px solid #999',
          paddingRight: '10px',
        }}
      >
        {/* Уплатилац */}
        <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
          уплатилац
        </div>
        <div
          style={{
            border: '1px solid #333',
            width: '344px',
            height: '57px',
            padding: '4px 6px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {userName || ''}
          </span>
        </div>

        {/* Сврха уплате */}
        <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
          сврха уплате
        </div>
        <div
          style={{
            border: '1px solid #333',
            width: '344px',
            height: '57px',
            padding: '4px 6px',
            marginBottom: '4px',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.3' }}>
            {purposeText}
          </span>
        </div>

        {/* Прималац */}
        <div style={{ marginBottom: '2px', fontSize: '12px', color: '#333' }}>
          прималац
        </div>
        <div
          style={{
            border: '1px solid #333',
            width: '344px',
            height: '57px',
            padding: '4px 6px',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'pre-line', lineHeight: '1.3' }}>
            {recipient}
          </span>
        </div>
      </div>

      {/* ===== RIGHT SIDE (naslov, iznos, racun, poziv) ===== */}
      <div
        style={{
          float: 'right',
          width: '380px',
          height: '265px',
        }}
      >
        {/* Title - НАЛОГ ЗА УПЛАТУ */}
        <div
          style={{
            textTransform: 'uppercase',
            fontWeight: '900',
            fontFamily: 'Verdana, Geneva, sans-serif',
            fontSize: '16px',
            float: 'right',
            width: '174px',
            marginRight: '26px',
            marginTop: '11px',
            letterSpacing: '0.5px',
          }}
        >
          налог за уплату
        </div>

        {/* Clear float */}
        <div style={{ clear: 'both' }}></div>

        {/* Šifra, Valuta, Iznos row */}
        <div
          style={{
            width: '348px',
            marginTop: '30px',
            marginLeft: '20px',
          }}
        >
          {/* Labels row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '3px' }}>
            <div style={{ width: '50px', fontSize: '11px', color: '#333', lineHeight: '1.2' }}>
              шифра плаћања
            </div>
            <div style={{ width: '50px', marginLeft: '14px', fontSize: '12px', color: '#333' }}>
              валута
            </div>
            <div style={{ flex: 1, marginLeft: '14px', fontSize: '12px', color: '#333' }}>
              износ
            </div>
          </div>
          {/* Input boxes row */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '24px',
                border: '2px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{paymentCode}</span>
            </div>
            <div
              style={{
                width: '50px',
                height: '24px',
                border: '2px solid #333',
                marginLeft: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'uppercase',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>RSD</span>
            </div>
            <div
              style={{
                flex: 1,
                height: '24px',
                border: '2px solid #333',
                marginLeft: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontWeight: '900', fontSize: '16px', color: '#D62828' }}>
                {formattedAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Рачун примаоца */}
        <div
          style={{
            width: '348px',
            marginLeft: '20px',
            marginTop: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#333', marginBottom: '3px' }}>
            рачун примаоца
          </div>
          <div
            style={{
              width: '100%',
              height: '24px',
              border: '2px solid #333',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '1.5px',
              }}
            >
              {accountDisplay}
            </span>
          </div>
        </div>

        {/* Модел и позив на број */}
        <div
          style={{
            width: '348px',
            marginLeft: '20px',
            marginTop: '12px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#333', marginBottom: '3px' }}>
            модел и позив на број (одобрење)
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '24px',
                border: '2px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{model}</span>
            </div>
            <div
              style={{
                flex: 1,
                height: '24px',
                border: '2px solid #333',
                marginLeft: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: '#D62828',
                }}
              >
                {paymentReference}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '100%',
          height: '70px',
          paddingLeft: '19px',
          paddingTop: '10px',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '8px',
        }}
      >
        {/* Печат и потпис */}
        <div style={{ width: '200px' }}>
          <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
            печат и потпис уплатиоца
          </div>
        </div>

        {/* Место и датум */}
        <div style={{ width: '190px', marginLeft: '70px' }}>
          <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
            место и датум пријема
          </div>
        </div>

        {/* Датум валуте */}
        <div style={{ width: '130px', marginLeft: '50px' }}>
          <div style={{ borderTop: '1px solid #333', paddingTop: '2px', fontSize: '11px', color: '#333' }}>
            датум валуте
          </div>
        </div>
      </div>
    </div>
  );
});

export default DrawnPaymentSlip;
