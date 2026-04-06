import React, { useEffect } from "react";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  // لوج لمعرفة قيمة PAYPAL_CLIENT_ID
  const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  console.log("PayPal Client ID:", clientId);

  useEffect(() => {
    if (!clientId) return; // لا تحمل السكريبت إذا لم يوجد clientId
    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
      script.async = true;
      script.onload = () =>
        window.dispatchEvent(new Event("paypalScriptLoaded"));
      document.body.appendChild(script);
    } else {
      window.dispatchEvent(new Event("paypalScriptLoaded"));
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    const renderButton = () => {
      if (window.paypal && document.getElementById("paypal-button-container")) {
        window.paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{ amount: { value: amount } }],
              });
            },
            onApprove: (data, actions) => {
              return actions.order.capture().then((details) => {
                if (onSuccess) onSuccess(details);
              });
            },
            onError: (err) => {
              if (onError) onError(err);
            },
          })
          .render("#paypal-button-container");
      }
    };
    window.addEventListener("paypalScriptLoaded", renderButton);
    return () => {
      window.removeEventListener("paypalScriptLoaded", renderButton);
    };
  }, [amount, onSuccess, onError, clientId]);

  if (!clientId) {
    return (
      <div className="text-danger">
        PayPal Client ID غير متوفر. تأكد من ملف البيئة وإعادة تشغيل التطبيق.
      </div>
    );
  }

  return <div id="paypal-button-container"></div>;
};

export default PayPalButton;
